// /models/enquadramentoModel.js

class CnaeAnalisado {
    constructor(cnae, tipo, descricao, sindicato, municipioUf, status) {
        this.cnae = cnae;
        this.tipo = tipo; // 'Principal' | 'Secundário'
        this.descricao = descricao;
        this.sindicato = sindicato;
        this.municipioUf = municipioUf;
        this.status = status; // 'Encontrado', 'Não encontrado', 'Sem sindicato para localidade'
    }
}

class Enquadramento {
    constructor() {
        this.sindicato = null;
        this.baseTerritorial = '';
        this.cnaeEnquadrado = null;
        this.descricaoCnaeEnquadrado = null;
        this.tipoCnae = null; // 'Principal' | 'Secundário'
        this.regraUtilizada = ''; // 'Município Específico', 'Abrangência Estadual'
        this.status = 'Não identificado'; // 'Enquadrado' | 'Não identificado' | 'Análise necessária'
        this.cnaesAnalisados = [];
        this.motivo = '';
    }
}

module.exports = { CnaeAnalisado, Enquadramento };