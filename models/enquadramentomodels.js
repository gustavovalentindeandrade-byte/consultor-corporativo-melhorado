// /models/enquadramentoModel.js

class CnaeAnalisado {
    constructor(cnae, tipo, descricao, sindicato, municipioUf, regra, status) {
        this.cnae = cnae;
        this.tipo = tipo; // 'Principal' | 'Secundário'
        this.descricao = descricao;
        this.sindicato = sindicato || '-';
        this.municipioUf = municipioUf;
        this.regraUtilizada = regra || '-';
        this.status = status; // 'Enquadrado', 'Sem correspondência'
    }
}

class Enquadramento {
    constructor() {
        this.sindicato = null;
        this.baseTerritorial = '';
        this.cnaeEnquadrado = null;
        this.descricaoCnaeEnquadrado = null;
        this.tipoCnae = null; 
        this.regraUtilizada = ''; 
        this.status = 'Não identificado'; // 'Enquadrado' | 'Não identificado' | 'Análise necessária'
        this.cnaesAnalisados = []; // Lista de instâncias de CnaeAnalisado
        this.motivo = 'Aguardando processamento.';
    }
}

module.exports = { CnaeAnalisado, Enquadramento };
