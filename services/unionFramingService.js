// /services/unionFramingService.js
const { Enquadramento, CnaeAnalisado } = require('../models/enquadramentoModel');
// Importe aqui as funções para ler a base de dados de sindicatos (provavelmente de um arquivo JSON ou banco de dados)

class UnionFramingService {
    constructor() {
        // Inicializar as estruturas de dados em memória:
        // this.cnaeDescriptionMap = new Map();
        // this.unionIndexMap = new Map();
        // this.validCnaeSet = new Set();
        this.loadData();
    }

    loadData() {
        // 1. Carregar dados dos arquivos .xlsx ou .json e popular os maps/sets.
        // Esta lógica será implementada aqui.
        console.log('Base de dados de sindicatos carregada.');
    }

    normalizeCnae(cnae) {
        if (!cnae) return '';
        return cnae.replace(/\D/g, '');
    }

    getUnionFraming(companyData) {
        const response = new Enquadramento();
        // ... (implementar a lógica do algoritmo descrito na Etapa 3, usando os models)
        // ... (preencher response.cnaesAnalisados com instâncias de CnaeAnalisado)
        return response;
    }
}

module.exports = new UnionFramingService();