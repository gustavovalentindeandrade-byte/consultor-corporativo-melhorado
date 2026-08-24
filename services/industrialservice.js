// /services/industrialservice.js
const unionFramingService = require('./unionFramingService.js');
// ... seus outros imports originais ...

async function consultarCNPJ(cnpj) {
    try {
        // Lógica existente preservada
        const dadosCNPJ = await consultarAPICNPJ(cnpj); 

        // --- NOVA INTEGRAÇÃO ---
        // Normalizamos as chaves caso a sua API retorne nomes diferentes
        const companyData = {
            cnpj: cnpj,
            razaoSocial: dadosCNPJ.razao_social || dadosCNPJ.nome, // ajuste conforme sua API
            uf: dadosCNPJ.uf,
            municipio: dadosCNPJ.municipio,
            cnaePrincipal: {
                codigo: dadosCNPJ.cnae_principal_codigo || dadosCNPJ.atividade_principal[0].code,
                descricao: dadosCNPJ.cnae_principal_descricao || dadosCNPJ.atividade_principal[0].text
            },
            cnaesSecundarios: dadosCNPJ.atividades_secundarias.map(ativ => ({
                codigo: ativ.code,
                descricao: ativ.text
            })) || []
        };

        const enquadramentoResult = unionFramingService.getUnionFraming(companyData);

        const resultadoFinal = {
            ...dadosCNPJ, 
            enquadramentoSindical: enquadramentoResult 
        };

        // Salva no histórico (certifique-se que o historyrepository aceita objetos grandes)
        await salvarHistorico(cnpj, resultadoFinal);

        return resultadoFinal;
    } catch (error) {
        console.error("Erro na consulta:", error);
        throw error;
    }
}
