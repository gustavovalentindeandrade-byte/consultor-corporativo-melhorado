// services/cnpjservice.js
import { ApiClient } from '../js/api.js';
import { Utils } from '../js/utils.js'; 
import { CacheManager } from '../cache/cache.js';
import { Empresa } from '../models/empresa.js';
import { Logger } from '../js/logger.js';

export const CnpjService = {
    async consultar(cnpjInput) {
        const cnpjLimpo = Utils.cleanCNPJ(cnpjInput);
        if (!cnpjLimpo || cnpjLimpo.length !== 14) {
            throw new Error("CNPJ inválido.");
        }

        const cachedData = CacheManager?.get ? CacheManager.get(cnpjLimpo) : null;
        if (cachedData) return new Empresa(cachedData, 'Cache Local');

        const providers = [
            { name: 'BrasilAPI', url: `https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}` },
            { name: 'CNPJ.ws', url: `https://publica.cnpj.ws/cnpj/${cnpjLimpo}` }
        ];

        let ultimoErro = null;

        for (const provider of providers) {
            const inicio = performance.now();
            try {
                const { response, responseTimeMs } = await ApiClient.fetchWithRetry(provider.url);
                const rawJson = await response.json();
                const normalizedData = this._normalizeProviderResponse(provider.name, rawJson, cnpjLimpo);

                if (normalizedData.cnpj) {
                    if (CacheManager?.set) CacheManager.set(cnpjLimpo, normalizedData);

                    Logger.logConsulta({
                        cnpj: cnpjLimpo,
                        url: provider.url,
                        provider: provider.name,
                        responseTimeMs,
                        status: response.status,
                        fallbackUsed: provider.name !== 'BrasilAPI',
                        totalTimeMs: Math.round(performance.now() - inicio),
                        finalResult: 'Sucesso'
                    });

                    return new Empresa(normalizedData, provider.name);
                }
            } catch (err) {
                ultimoErro = err;
                Logger.warn(`Provedor ${provider.name} falhou para CNPJ ${cnpjLimpo}: ${err.message}`);
                // Continua para o próximo provedor apenas se não for 404 garantido
                continue;
            }
        }

        // Se ambos falharam, propaga o erro real (429, Timeout ou 404)
        if (ultimoErro?.status === 429) {
            throw new Error("Limite de requisições excedido nas APIs públicas (429). Aguarde alguns instantes.");
        }
        if (ultimoErro?.status === 404) {
            throw new Error("CNPJ não encontrado na base da Receita Federal.");
        }
        throw new Error(ultimoErro?.message || "Não foi possível consultar os dados do CNPJ.");
    },

    _normalizeProviderResponse(p, raw, cnpjFallback) {
        if (p === 'CNPJ.ws') {
            const est = raw.estabelecimento || {};
            // Mapeia secundárias completas do CNPJ.ws
            const secundarias = Array.isArray(est.atividades_secundarias)
                ? est.atividades_secundarias.map(s => ({ codigo: s.id, descricao: s.descricao }))
                : [];

            return {
                cnpj: est.cnpj || cnpjFallback,
                razao_social: raw.razao_social || 'N/A',
                nome_fantasia: est.nome_fantasia || raw.razao_social || 'Não informado',
                descricao_situacao_cadastral: est.situacao_cadastral || '-',
                data_inicio_atividade: est.data_inicio_atividade || '',
                porte: raw.porte?.descricao || 'Não informado',
                natureza_juridica: raw.natureza_juridica?.descricao || '-',
                logradouro: est.tipo_logradouro ? `${est.tipo_logradouro} ${est.logradouro}` : (est.logradouro || ''),
                numero: est.numero || '',
                complemento: est.complemento || '',
                bairro: est.bairro || '',
                municipio: est.cidade?.nome || 'N/A',
                uf: est.estado?.sigla || 'N/A',
                cep: est.cep || '',
                telefone: est.telefone1 || '',
                email: est.email || '',
                cnae_fiscal: est.atividade_principal?.id,
                cnae_fiscal_descricao: est.atividade_principal?.descricao,
                cnaes_secundarios: secundarias
            };
        }

        // BrasilAPI
        return {
            ...raw,
            cnpj: raw.cnpj || cnpjFallback
        };
    }
};
