// js/batch.js
import { CnpjService } from '../services/cnpjservice.js';
import { Utils } from './utils.js';

export const BatchProcessor = {
    async processar(cnpjs, onProgress, onRowComplete, abortSignal = { aborted: false }) {
        for (let i = 0; i < cnpjs.length; i++) {
            if (abortSignal.aborted) break;

            const raw = cnpjs[i];
            const formatted = Utils.formatCNPJ ? Utils.formatCNPJ(raw) : raw;
            if (onProgress) onProgress(i + 1, cnpjs.length, formatted);

            try {
                const empresa = await CnpjService.consultar(raw);
                if (onRowComplete) onRowComplete(formatted, empresa, null, 'Sucesso', null);

                // Intervalo de segurança entre requisições
                await new Promise(r => setTimeout(r, 600));
            } catch (err) {
                // Se receber 429 nas APIs, aguarda 3 segundos antes do próximo
                if (err.message && err.message.includes('429')) {
                    await new Promise(r => setTimeout(r, 3000));
                }
                if (onRowComplete) onRowComplete(formatted, null, null, 'Erro', err.message);
            }
        }
    }
};
