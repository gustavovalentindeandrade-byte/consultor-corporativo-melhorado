// /services/unionFramingService.js
const fs = require('fs');
const path = require('path');
const { Enquadramento, CnaeAnalisado } = require('../models/enquadramentoModel');
const BASE_DATA_PATH = path.join(__dirname, '..', 'data', 'baseSindicatos.json');

class UnionFramingService {
    constructor() {
        // Estruturas de dados em memória para busca rápida
        this.cnaeDescriptionMap = new Map(); // Chave: CNAE Ajustado 2, Valor: Descrição
        this.unionIndexMap = new Map(); // Chave: UF, Valor: Lista de objetos de abrangência
        this.validCnaeSet = new Set(); // Conjunto de CNAEs válidos
        this.loadData();
    }

    /**
     * Carrega os dados da base de sindicatos a partir do arquivo JSON
     */
    loadData() {
        try {
            if (fs.existsSync(BASE_DATA_PATH)) {
                const rawData = fs.readFileSync(BASE_DATA_PATH, 'utf8');
                const data = JSON.parse(rawData);
                
                // Carregar descrições de CNAE
                if (data.cnaeDescriptions) {
                    Object.entries(data.cnaeDescriptions).forEach(([cnae, descricao]) => {
                        this.cnaeDescriptionMap.set(cnae, descricao);
                    });
                }
                
                // Carregar índices de abrangência
                if (data.unionIndex) {
                    Object.entries(data.unionIndex).forEach(([uf, abrangencias]) => {
                        this.unionIndexMap.set(uf, abrangencias);
                    });
                }
                
                // Popular conjunto de CNAEs válidos
                this.validCnaeSet = new Set(data.validCnaes || []);
                
                console.log(`Base de dados de sindicatos carregada com sucesso.`);
                console.log(`- ${this.cnaeDescriptionMap.size} descrições de CNAE`);
                console.log(`- ${this.validCnaeSet.size} CNAEs válidos`);
                console.log(`- ${this.unionIndexMap.size} UFs com abrangências`);
            } else {
                console.warn('Arquivo de base de sindicatos não encontrado. Use o script de importação para gerá-lo.');
            }
        } catch (error) {
            console.error('Erro ao carregar base de dados de sindicatos:', error);
        }
    }

    /**
     * Normaliza o CNAE removendo caracteres não numéricos
     */
    normalizeCnae(cnae) {
        if (!cnae) return '';
        // Remove todos os caracteres não numéricos
        return cnae.replace(/\D/g, '');
    }

    /**
     * Obtém a descrição de um CNAE a partir do código normalizado
     */
    getCnaeDescription(cnae) {
        const normalized = this.normalizeCnae(cnae);
        return this.cnaeDescriptionMap.get(normalized) || 'Descrição não encontrada';
    }

    /**
     * Verifica se um CNAE existe na base
     */
    isValidCnae(cnae) {
        const normalized = this.normalizeCnae(cnae);
        return this.validCnaeSet.has(normalized);
    }

    /**
     * Método principal para realizar o enquadramento de uma empresa
     * @param {Object} companyData - Dados da empresa obtidos da consulta do CNPJ
     * @returns {Enquadramento} Objeto com o resultado do enquadramento
     */
    getUnionFraming(companyData) {
        const response = new Enquadramento();
        
        // Validar dados de entrada
        if (!companyData || !companyData.uf || !companyData.cnaePrincipal) {
            response.definirFalha('Dados da empresa incompletos para enquadramento');
            return response;
        }

        // 1. Preparar a lista de CNAEs para análise (principal primeiro)
        const cnaePrincipalNormalizado = this.normalizeCnae(companyData.cnaePrincipal);
        const cnaesSecundariosNormalizados = (companyData.cnaesSecundarios || [])
            .map(c => this.normalizeCnae(c));

        const cnaesParaAnalisar = [
            { cnae: cnaePrincipalNormalizado, tipo: 'Principal' },
            ...cnaesSecundariosNormalizados.map(c => ({ cnae: c, tipo: 'Secundário' }))
        ];

        let resultadoEncontrado = false;
        const motivos = [];

        // 2. Loop de análise de cada CNAE
        for (const item of cnaesParaAnalisar) {
            const cnaeAtual = item.cnae;
            const tipoCnae = item.tipo;
            const descricaoCnae = this.cnaeDescriptionMap.get(cnaeAtual) || null;
            let sindicatoEncontrado = null;
            let regraUtilizada = '';
            let baseTerritorial = '';
            let statusAnalise = '';

            // 2a. Verificar se o CNAE existe na base
            if (!this.validCnaeSet.has(cnaeAtual)) {
                statusAnalise = 'Não encontrado';
                response.adicionarCnaeAnalisado(
                    cnaeAtual,
                    tipoCnae,
                    descricaoCnae,
                    null,
                    `${companyData.municipio || ''} - ${companyData.uf}`,
                    statusAnalise
                );
                motivos.push(`CNAE ${cnaeAtual}: não encontrado na base`);
                continue;
            }

            // 2b. Buscar na base de abrangência para a UF da empresa
            const abrangenciasUf = this.unionIndexMap.get(companyData.uf) || [];

            // 2b.i. Buscar por regra específica (Município)
            let regraEspecifica = abrangenciasUf.find(
                (a) => a.municipio === companyData.municipio && a.cnae === cnaeAtual
            );

            if (regraEspecifica) {
                sindicatoEncontrado = regraEspecifica.sindicato;
                regraUtilizada = 'Município Específico';
                baseTerritorial = `${companyData.municipio} - ${companyData.uf}`;
                statusAnalise = 'Encontrado';
            } else {
                // 2b.ii. Buscar por regra geral (UF)
                let regraGeral = abrangenciasUf.find(
                    (a) => (!a.municipio || a.municipio === '') && a.cnae === cnaeAtual
                );

                if (regraGeral) {
                    sindicatoEncontrado = regraGeral.sindicato;
                    regraUtilizada = 'Abrangência Estadual';
                    baseTerritorial = companyData.uf;
                    statusAnalise = 'Encontrado';
                } else {
                    statusAnalise = 'Sem sindicato para localidade';
                    motivos.push(`CNAE ${cnaeAtual}: sem sindicato para ${companyData.municipio}/${companyData.uf}`);
                }
            }

            // 2c. Armazenar o resultado da análise deste CNAE
            response.adicionarCnaeAnalisado(
                cnaeAtual,
                tipoCnae,
                descricaoCnae,
                sindicatoEncontrado,
                baseTerritorial || `${companyData.municipio || ''} - ${companyData.uf}`,
                statusAnalise
            );

            // 2d. Se encontrou um sindicato, atualiza a resposta principal e sai do loop
            if (sindicatoEncontrado) {
                response.definirEnquadramento(
                    sindicatoEncontrado,
                    baseTerritorial,
                    cnaeAtual,
                    descricaoCnae,
                    tipoCnae,
                    regraUtilizada
                );
                resultadoEncontrado = true;
                break;
            }
        }

        // 3. Se não encontrou nenhum sindicato, definir falha
        if (!resultadoEncontrado) {
            const motivoFinal = motivos.length > 0 
                ? `Nenhum sindicato identificado. Motivos: ${motivos.join('; ')}`
                : 'Nenhum sindicato identificado para os CNAEs informados';
            response.definirFalha(motivoFinal);
        }

        return response;
    }

    /**
     * Método para recarregar a base de dados (útil em desenvolvimento)
     */
    reloadData() {
        this.cnaeDescriptionMap.clear();
        this.unionIndexMap.clear();
        this.validCnaeSet.clear();
        this.loadData();
    }
}

module.exports = new UnionFramingService();
