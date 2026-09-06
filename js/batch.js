// js/batch.js
import { CnpjService } from '../services/cnpjservice.js';
import { IndustrialService } from '../services/industrialservice.js';
import { Utils } from './utils.js';
import { CONFIG } from '../config/config.js';

export const BatchProcessor = {
    /**
     * Processa uma lista de CNPJs de forma controlada
     * @param {string[]} cnpjs Lista de CNPJs limpos ou mascarados
     * @param {Function} onProgress Callback de progresso (atual, total, cnpjAtual)
     * @param {Function} onRowComplete Callback de conclusão de linha (cnpj, empresa, analise, status, erroMsg)
     * @param {Object} abortSignal Objeto contendo { aborted: boolean } para cancelamento
     */
    async processar(cnpjs, onProgress, onRowComplete, abortSignal = { aborted: false }) {
        if (!Array.isArray(cnpjs) || cnpjs.length === 0) return;

        const total = cnpjs.length;
        const delayEntreRequisicoes = CONFIG?.BATCH_DELAY_MS || 500;

        for (let i = 0; i < total; i++) {
            if (abortSignal.aborted) {
                if (onRowComplete) onRowComplete(cnpjs[i], null, null, 'Cancelado', 'Processamento interrompido pelo usuário.');
                break;
            }

            const raw = cnpjs[i];
            const formatted = Utils?.formatCNPJ ? Utils.formatCNPJ(raw) : raw;

            if (onProgress) onProgress(i + 1, total, formatted);

            try {
                // 1. Consulta o CNPJ
                const empresa = await CnpjService.consultar(raw);

                // 2. Executa a Análise Industrial (se o serviço estiver carregado)
                let analise = null;
                if (typeof IndustrialService?.analisar === 'function') {
                    analise = IndustrialService.analisar(empresa);
                }

                if (onRowComplete) onRowComplete(formatted, empresa, analise, 'Sucesso', null);

                // Intervalo de segurança para respeitar limites da API
                await new Promise(r => setTimeout(r, delayEntreRequisicoes));

            } catch (err) {
                const erroMsg = err?.message || 'Erro inesperado na consulta.';
                
                // Se a API sinalizar limite excedido, aplica pausa defensiva de 3s
                if (erroMsg.includes('429') || erroMsg.toLowerCase().includes('limite')) {
                    await new Promise(r => setTimeout(r, 3000));
                }

                if (onRowComplete) onRowComplete(formatted, null, null, 'Erro', erroMsg);
            }
        }
    }
};
