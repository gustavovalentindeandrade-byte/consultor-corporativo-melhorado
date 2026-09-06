// models/empresa.js
export class Empresa {
    constructor(rawData, providerName) {
        this.cnpj = rawData.cnpj || '';
        this.razaoSocial = rawData.razao_social || rawData.razaoSocial || '';
        this.nomeFantasia = rawData.nome_fantasia || rawData.nomeFantasia || 'Não informado';
        this.situacaoCadastral = rawData.descricao_situacao_cadastral || rawData.situacao || '-';
        this.dataAbertura = rawData.data_inicio_atividade || rawData.dataAbertura || '';
        this.porte = rawData.porte || 'Não informado';
        this.naturezaJuridica = rawData.natureza_juridica || rawData.naturezaJuridica || '-';
        this.logradouro = rawData.logradouro || '';
        this.numero = rawData.numero || '';
        this.complemento = rawData.complemento || '';
        this.bairro = rawData.bairro || '';
        this.municipio = rawData.municipio || rawData.cidade || '';
        this.uf = rawData.uf || '';
        this.cep = rawData.cep || '';
        this.telefone = rawData.telefone || '';
        this.email = rawData.email || '';

        // Blindagem: Garante que o CNAE tenha 7 dígitos mesmo que venha como número
        const codCnae = rawData.cnae_fiscal || rawData.cnaePrincipal?.codigo || '';
        this.cnaePrincipalCod = codCnae ? String(codCnae).replace(/\D/g, '').padStart(7, '0') : '';
        this.cnaePrincipalDesc = rawData.cnae_fiscal_descricao || rawData.cnaePrincipal?.descricao || 'Sem descrição';
        
        this.cnaesSecundarios = this._normalizeCnaesSecundarias(rawData.cnaes_secundarios || rawData.cnaesSecundarias || []);
        this.provider = providerName;
    }

    _normalizeCnaesSecundarias(cnaes) {
        if (!Array.isArray(cnaes)) return [];
        return cnaes.map(c => {
            const rawCod = c.codigo || c.code || c.id || '';
            return {
                codigo: rawCod ? String(rawCod).replace(/\D/g, '').padStart(7, '0') : '',
                descricao: c.descricao || c.text || 'Sem descrição'
            };
        });
    }
}
