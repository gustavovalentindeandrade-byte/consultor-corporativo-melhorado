import { Utils } from './utils.js';
import { UI } from './ui.js';
// Nomes dos arquivos em minúsculo conforme você alterou:
import { CnpjService } from '../services/cnpjservice.js';
import { IndustrialService } from '../services/industrialservice.js';

async function realizarConsulta() {
    const input = document.getElementById('cnpjInput');
    const cnpjLimpo = Utils.cleanCNPJ(input.value);

    if (!Utils.isValidCNPJ(cnpjLimpo)) {
        UI.showAlert("CNPJ inválido.", "warning");
        return;
    }

    UI.clearAlert();
    UI.toggleLoading(true);
    UI.toggleResult(false);

    try {
        const empresa = await CnpjService.consultar(cnpjLimpo);
        const analise = IndustrialService.analisar(empresa, true);
        UI.renderFicha(empresa, analise);
        UI.toggleResult(true);
    } catch (error) {
        UI.showAlert(error.message || "Erro na consulta", "danger");
    } finally {
        UI.toggleLoading(false);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btnConsultar');
    if (btn) btn.onclick = realizarConsulta;
    
    const input = document.getElementById('cnpjInput');
    if (input) {
        input.oninput = (e) => e.target.value = Utils.formatCNPJ(e.target.value);
        input.onkeypress = (e) => { if (e.key === 'Enter') realizarConsulta(); };
    }
});
