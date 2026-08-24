javascript
// /services/industrialservice.js
const unionFramingService = require('./unionFramingService.js');
// ... outros imports

// Na função que realiza a consulta do CNPJ:
async function consultarCNPJ(cnpj) {
    try {
        // 1. Chamada para a API de CNPJ (lógica existente)
        const dadosCNPJ = await consultarAPICNPJ(cnpj); 

        // 2. --- NOVA LÓGICA DE ENQUADRAMENTO SINDICAL ---
        // Preparar os dados da empresa para o serviço
        const companyData = {
            cnpj: cnpj,
            razaoSocial: dadosCNPJ.razao_social,
            uf: dadosCNPJ.uf,
            municipio: dadosCNPJ.municipio,
            cnaePrincipal: dadosCNPJ.cnae_principal,
            cnaesSecundarios: dadosCNPJ.cnaes_secundarios || [],
        };
        const enquadramentoResult = unionFramingService.getUnionFraming(companyData);

        // 3. Combinar os resultados existentes com o novo enquadramento
        const resultadoFinal = {
            ...dadosCNPJ, // Dados originais do CNPJ
            enquadramentoSindical: enquadramentoResult, // Novo dado
        };

        // 4. Salvar no histórico (modificar para incluir o novo campo)
        await salvarHistorico(cnpj, resultadoFinal);

        return resultadoFinal;
    } catch (error) {
        // ... tratamento de erros
    }
}
