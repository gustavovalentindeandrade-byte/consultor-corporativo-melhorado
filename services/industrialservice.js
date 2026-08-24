// /services/industrialservice.js

import { Utils } from '../js/utils.js';
import { ResultadoAnalise } from '../models/resultadoanalise.js';
import unionFramingService from './unionFramingService.js'; // Importa o novo serviço de enquadramento sindical

export const IndustrialService = {
    analisar(empresa, analisarSecundarias = true) {
        // 1. Lógica original mantida intacta
        const normPrincipal = Utils.normalizeCnae(empresa.cnaePrincipalCod);
        
        // ... sua lógica de análise industrial existente continua aqui ...
        
        // 2. --- NOVA INTEGRAÇÃO DE ENQUADRAMENTO SINDICAL ---
        // Prepara os dados da empresa usando os campos padrão recebidos no objeto 'empresa'
        const companyData = {
            cnpj: empresa.cnpj || '',
            razaoSocial: empresa.razaoSocial || empresa.nome || '',
            uf: empresa.uf || '',
            municipio: empresa.municipio || '',
            cnaePrincipal: {
                codigo: empresa.cnaePrincipalCod || '',
                descricao: empresa.cnaePrincipalDescricao || ''
            },
            // Garante compatibilidade caso os secundários venham como array de objetos ou array de códigos
            cnaesSecundarios: Array.isArray(empresa.cnaesSecundarios) 
                ? empresa.cnaesSecundarios 
                : (empresa.cnaesSecundariosCodList || []).map(c => ({ 
                    codigo: typeof c === 'string' ? c : c.codigo, 
                    descricao: c.descricao || '' 
                }))
        };

        // Executa o motor de enquadramento sindical
        const enquadramentoResult = unionFramingService.getUnionFraming(companyData);

        // 3. Retorno consolidado (mantém o original e acopla a nova propriedade)
        return {
            perfil: "Verificado",
            possuiIndustrial: false, // Mantido do seu código original
            todasAnalisadas: [],     // Mantido do seu código original
            enquadramentoSindical: enquadramentoResult // Novo dado de enquadramento sindical integrado
        };
    }
};
