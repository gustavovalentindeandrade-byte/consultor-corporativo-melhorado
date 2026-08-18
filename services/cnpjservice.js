import { ApiClient } from '../js/api.js';
import { Utils } from '../js/utils.js'; // ISSO CORRIGE O ERRO DO PRINT
import { CacheManager } from '../cache/cache.js';
import { Empresa } from '../models/empresa.js';

export const CnpjService = {
    async consultar(cnpjInput) {
        const cnpjLimpo = Utils.cleanCNPJ(cnpjInput);
        const cachedData = CacheManager.get(cnpjLimpo);
        if (cachedData) return new Empresa(cachedData, 'Cache Local');

        const providers = [
            { name: 'BrasilAPI', url: `https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}` },
            { name: 'CNPJ.ws', url: `https://publica.cnpj.ws/cnpj/${cnpjLimpo}` }
        ];

        for (const provider of providers) {
            try {
                const { response } = await ApiClient.fetchWithRetry(provider.url);
                const rawJson = await response.json();
                let normalizedData = this._normalizeProviderResponse(provider.name, rawJson);
                if (normalizedData.cnpj) {
                    CacheManager.set(cnpjLimpo, normalizedData);
                    return new Empresa(normalizedData, provider.name);
                }
            } catch (err) { continue; }
        }
        throw new Error("CNPJ não encontrado nas bases oficiais.");
    },

    _normalizeProviderResponse(p, raw) {
        if (p === 'CNPJ.ws') {
            return {
                cnpj: raw.estabelecimento?.cnpj,
                razao_social: raw.razao_social,
                nome_fantasia: raw.estabelecimento?.nome_fantasia,
                descricao_situacao_cadastral: raw.estabelecimento?.situacao_cadastral,
                data_inicio_atividade: raw.estabelecimento?.inicio_atividade,
                porte: raw.porte?.descricao,
                cnae_fiscal: raw.estabelecimento?.atividade_principal?.id,
                cnae_fiscal_descricao: raw.estabelecimento?.atividade_principal?.descricao,
                cnaes_secundarios: raw.estabelecimento?.atividades_secundarias?.map(a => ({ codigo: a.id, descricao: a.descricao })),
                municipio: raw.estabelecimento?.cidade?.nome,
                uf: raw.estabelecimento?.estado?.sigla
            };
        }
        return raw;
    }
};
