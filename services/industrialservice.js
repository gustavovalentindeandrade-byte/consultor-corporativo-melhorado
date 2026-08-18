// services/industrialService.js - Trecho Melhorado
const MEMORY_DB_CACHE = new Map(); // Cache de CNAEs já consultados no Supabase

export const IndustrialService = {
    async obterClassificacaoAvancada(empresa, analisarSecundarias = true, supabaseClient = null) {
        // ... (Montagem da lista de CNAEs mantida)

        // Filtra apenas CNAEs que ainda não temos no Cache de Memória
        const codigosParaConsultar = codigosParaBusca.filter(cod => !MEMORY_DB_CACHE.has(cod));

        if (supabaseClient && codigosParaConsultar.length > 0) {
            const { data, error } = await supabaseClient
                .from('cnaes_classificacao')
                .select('*')
                .in('codigo', codigosParaConsultar);

            if (!error && data) {
                data.forEach(item => MEMORY_DB_CACHE.set(String(item.codigo), item));
            }
        }

        // Agora monta a análise usando o Cache de Memória (Rápido e sem requisições extras)
        listaCompletaAnalise.forEach(cnae => {
            const codigoLimpo = normalizarParaBusca(cnae.codigo);
            const matchDB = MEMORY_DB_CACHE.get(codigoLimpo);
            // ... (Restante da lógica de cruzamento)
        });
        
        return analiseAvancada;
    }
};
