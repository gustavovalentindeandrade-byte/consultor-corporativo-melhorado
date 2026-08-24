// /models/enquadramentoModel.js

class CnaeAnalisado {
    constructor(cnae, tipo, descricao, sindicato, municipioUf, status) {
        this.cnae = cnae || '';
        this.tipo = tipo || ''; // 'Principal' | 'Secundário'
        this.descricao = descricao || '';
        this.sindicato = sindicato || null;
        this.municipioUf = municipioUf || '';
        this.status = status || 'Não analisado'; // 'Encontrado', 'Não encontrado', 'Sem sindicato para localidade'
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

    // Método para adicionar um CNAE analisado
    adicionarCnaeAnalisado(cnae, tipo, descricao, sindicato, municipioUf, status) {
        const cnaeAnalisado = new CnaeAnalisado(cnae, tipo, descricao, sindicato, municipioUf, status);
        this.cnaesAnalisados.push(cnaeAnalisado);
        return cnaeAnalisado;
    }

    // Método para definir o enquadramento encontrado
    definirEnquadramento(sindicato, baseTerritorial, cnae, descricao, tipo, regra) {
        this.sindicato = sindicato;
        this.baseTerritorial = baseTerritorial;
        this.cnaeEnquadrado = cnae;
        this.descricaoCnaeEnquadrado = descricao;
        this.tipoCnae = tipo;
        this.regraUtilizada = regra;
        this.status = 'Enquadrado';
    }

    // Método para definir falha no enquadramento
    definirFalha(motivo) {
        this.status = 'Não identificado';
        this.motivo = motivo;
    }
}

module.exports = { CnaeAnalisado, Enquadramento };
