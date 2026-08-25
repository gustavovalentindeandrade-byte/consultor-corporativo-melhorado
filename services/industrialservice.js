import { Utils } from '../js/utils.js';
import { ResultadoAnalise } from '../models/resultadoanalise.js'; // Verifique se o arquivo resultadoanalise.js também é minúsculo

export const IndustrialService = {
    analisar(empresa, analisarSecundarias = true) {
        const normPrincipal = Utils.normalizeCnae(empresa.cnaePrincipalCod);
        // ... sua lógica de análise industrial aqui ...
        
        return {
            perfil: "Verificado",
            possuiIndustrial: false, // exemplo
            todasAnalisadas: []
        };
    }
};
