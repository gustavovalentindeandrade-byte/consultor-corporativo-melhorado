// /services/unionFramingService.js
const { Enquadramento, CnaeAnalisado } = require('../models/enquadramentoModel');
const baseSindicatosJSON = require('../data/base_sindicatos.json'); // Gerado pelo script de importação

class UnionFramingService {
    constructor() {
        this.baseDados = baseSindicatosJSON;
    }

    _normalizarCNAE(cnae) {
        return cnae ? cnae.toString().replace(/[\.\-\/]/g, '') : '';
    }

    _normalizarTexto(texto) {
        if (!texto) return '';
        return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/\s+/g, '');
    }

    _buscarNaBase(cnaeNorm, municipioNorm, ufNorm) {
        // 1. Tenta Regra Específica (CNAE + Município + UF)
        const chaveMunicipio = `${cnaeNorm}${municipioNorm}${ufNorm}`;
        if (this.baseDados[chaveMunicipio]) {
            return { dados: this.baseDados[chaveMunicipio], regra: "Específica (Município)" };
        }
        
        // 2. Tenta Regra Estadual (CNAE + UF - Município vazio)
        const chaveEstado = `${cnaeNorm}${ufNorm}`;
        if (this.baseDados[chaveEstado]) {
            return { dados: this.baseDados[chaveEstado], regra: "Abrangência Estadual (UF)" };
        }
        
        return null;
    }

    getUnionFraming(companyData) {
        const response = new Enquadramento();
        const { uf, municipio, cnaePrincipal, cnaesSecundarios } = companyData;
        
        const ufNorm = this._normalizarTexto(uf);
        const munNorm = this._normalizarTexto(municipio);
        const localidadeExibicao = `${municipio}/${uf}`;

        let sindicatosEncontrados = [];

        const processarCnae = (cnaeObj, tipo) => {
            if (!cnaeObj || !cnaeObj.codigo) return;
            
            const cnaeNorm = this._normalizarCNAE(cnaeObj.codigo);
            const match = this._buscarNaBase(cnaeNorm, munNorm, ufNorm);
            
            if (match) {
                sindicatosEncontrados.push({ cnae: cnaeObj, tipo, match });
                response.cnaesAnalisados.push(new CnaeAnalisado(
                    cnaeObj.codigo, tipo, cnaeObj.descricao, match.dados.sindicato, localidadeExibicao, match.regra, 'Enquadrado'
                ));
            } else {
                response.cnaesAnalisados.push(new CnaeAnalisado(
                    cnaeObj.codigo, tipo, cnaeObj.descricao, null, localidadeExibicao, null, 'Sem correspondência'
                ));
            }
        };

        // 1. Analisa CNAE Principal
        processarCnae(cnaePrincipal, 'Principal');

        // 2. Analisa CNAEs Secundários
        if (cnaesSecundarios && Array.isArray(cnaesSecundarios)) {
            cnaesSecundarios.forEach(cnaeSec => processarCnae(cnaeSec, 'Secundário'));
        }

        // 3. Validação de Resultados e Conflitos
        if (sindicatosEncontrados.length === 0) {
            response.status = 'Não identificado';
            response.motivo = 'Nenhum CNAE (principal ou secundário) possui correspondência sindical para esta localidade.';
            return response;
        }

        const nomesSindicatos = [...new Set(sindicatosEncontrados.map(s => s.match.dados.sindicato))];
        
        if (nomesSindicatos.length > 1) {
            response.status = 'Análise necessária';
            response.motivo = 'Múltiplos sindicatos distintos encontrados nos CNAEs analisados. Requer validação manual.';
            this._preencherDadosEnquadramento(response, sindicatosEncontrados[0]);
        } else {
            response.status = 'Enquadrado';
            response.motivo = 'Enquadramento sindical determinado com sucesso.';
            this._preencherDadosEnquadramento(response, sindicatosEncontrados[0]);
        }

        return response;
    }

    _preencherDadosEnquadramento(response, matchObj) {
        response.sindicato = matchObj.match.dados.sindicato;
        response.baseTerritorial = matchObj.match.dados.sigla || 'Não informada';
        response.cnaeEnquadrado = matchObj.cnae.codigo;
        response.descricaoCnaeEnquadrado = matchObj.cnae.descricao;
        response.tipoCnae = matchObj.tipo;
        response.regraUtilizada = matchObj.match.regra;
    }
}

module.exports = new UnionFramingService();
