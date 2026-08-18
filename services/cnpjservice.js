// services/cnpjService.js - Trecho Melhorado
export const CnpjService = {
    async consultar(cnpjInput) {
        const cnpjLimpo = Utils.cleanCNPJ(cnpjInput);
        // ... (Verificação de cache mantida)

        // Estratégia de Provedores Otimizada
        const providers = [
            { name: 'BrasilAPI', url: `https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}` },
            { name: 'CNPJ.ws', url: `https://publica.cnpj.ws/cnpj/${cnpjLimpo}` },
            { name: 'ReceitaWS', url: `https://cors-anywhere.herokuapp.com/https://www.receitaws.com.br/v1/cnpj/${cnpjLimpo}` } // Exemplo de Proxy se necessário
        ];

        for (const provider of providers) {
            try {
                const { response, responseTimeMs } = await ApiClient.fetchWithRetry(provider.url);
                const rawJson = await response.json();
                
                // Validação de Dados Mínimos
                if (!rawJson.cnpj && !rawJson.estabelecimento) continue; 

                const normalizedData = this._normalizeProviderResponse(provider.name, rawJson);
                CacheManager.set(cnpjLimpo, normalizedData);
                return new Empresa(normalizedData, provider.name);
            } catch (err) {
                console.warn(`Provedor ${provider.name} falhou, tentando próximo...`);
                continue; 
            }
        }
        throw new Error("Todas as bases oficiais estão instáveis ou o CNPJ não existe.");
    }
};
