// js/main.js
import { Utils } from './utils.js';
import { UI } from './ui.js';
import { CnpjService } from '../services/cnpjService.js';
import { IndustrialService } from '../services/industrialService.js';

// Função que será chamada no clique
async function realizarConsulta() {
    const input = document.getElementById('cnpjInput');
    if (!input) return;

    const valorOriginal = input.value;
    const cnpjLimpo = Utils.cleanCNPJ(valorOriginal);

    if (!Utils.isValidCNPJ(cnpjLimpo)) {
        UI.showAlert("CNPJ inválido. Verifique os números.", "warning");
        return;
    }

    UI.clearAlert();
    UI.toggleLoading(true);
    UI.toggleResult(false);

    try {
        const empresa = await CnpjService.consultar(cnpjLimpo);
        const checkSec = document.getElementById('checkAnaliseSecundarios');
        const analisarSecundarias = checkSec ? checkSec.checked : true;
        
        const analise = IndustrialService.analisar(empresa, analisarSecundarias);
        
        UI.renderFicha(empresa, analise);
        UI.toggleResult(true);
    } catch (error) {
        console.error(error);
        UI.showAlert(error.message || "Erro ao consultar CNPJ.", "danger");
    } finally {
        UI.toggleLoading(false);
    }
}

// Configuração dos eventos ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btnConsultar');
    const input = document.getElementById('cnpjInput');

    if (btn) btn.addEventListener('click', realizarConsulta);
    if (input) {
        input.addEventListener('keypress', (e) => { if (e.key === 'Enter') realizarConsulta(); });
        input.addEventListener('input', (e) => { e.target.value = Utils.formatCNPJ(e.target.value); });
    }

    document.getElementById('btnLimpar')?.addEventListener('click', () => {
        if (input) input.value = '';
        UI.toggleResult(false);
        UI.clearAlert();
    });
});
