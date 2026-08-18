// js/main.js
import { CONFIG } from '../config/config.js';
import { Utils } from './utils.js';
import { CnpjService } from '../services/cnpjService.js';
import { IndustrialService } from '../services/industrialService.js';
import { UI } from './ui.js';
import { ExportService } from './export.js';
import { HistoryRepository } from '../storage/historyRepository.js';

const AppState = {
    supabaseClient: null,
    companyData: null,
    analiseData: null
};

// Inicialização segura do Supabase
try {
    if (window.supabase) {
        AppState.supabaseClient = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    }
} catch (e) { console.error("Falha Supabase:", e); }

document.addEventListener("DOMContentLoaded", () => {
    // Vincular botões IMEDIATAMENTE
    const btnConsultar = document.getElementById('btnConsultar');
    const inputCnpj = document.getElementById('cnpjInput');

    if (btnConsultar) {
        btnConsultar.onclick = () => realizarConsulta();
    }

    if (inputCnpj) {
        inputCnpj.onkeypress = (e) => { if (e.key === 'Enter') realizarConsulta(); };
        // Máscara automática
        inputCnpj.oninput = (e) => { e.target.value = Utils.formatCNPJ(e.target.value); };
    }

    // Outros botões de ação
    document.getElementById('btnLimpar')?.addEventListener('click', () => {
        inputCnpj.value = '';
        UI.toggleResult(false);
    });

    document.getElementById('btnCopiar')?.addEventListener('click', () => ExportService.copiar(AppState.companyData, AppState.analiseData));
    document.getElementById('btnExcel')?.addEventListener('click', () => ExportService.excelIndividual(AppState.companyData, AppState.analiseData));
    document.getElementById('btnPDF')?.addEventListener('click', () => ExportService.pdf(AppState.companyData));

    // Carregar histórico se o banco estiver ok
    if (AppState.supabaseClient) carregarHistorico();
});

async function realizarConsulta() {
    const input = document.getElementById('cnpjInput');
    const cnpj = Utils.cleanCNPJ(input.value);

    if (!Utils.isValidCNPJ(cnpj)) {
        UI.showAlert("CNPJ Inválido", "warning");
        return;
    }

    UI.toggleLoading(true);
    UI.toggleResult(false);

    try {
        // Chamada da API
        const empresa = await CnpjService.consultar(cnpj);
        AppState.companyData = empresa;

        // Análise Industrial
        const analise = IndustrialService.analisar(empresa, true);
        
        // Análise Supabase (Opcional - não trava se falhar)
        try {
            const avancada = await IndustrialService.obterClassificacaoAvancada(empresa, true, AppState.supabaseClient);
            analise.analiseAvancada = avancada;
        } catch (e) { console.warn("Erro na análise avançada"); }

        AppState.analiseData = analise;

        // Mostrar na tela
        UI.renderFicha(empresa, analise);
        UI.toggleResult(true);

        // Salvar Histórico (background)
        HistoryRepository.salvar(AppState.supabaseClient, empresa, analise);

    } catch (err) {
        UI.showAlert(err.message || "Erro ao consultar API", "danger");
    } finally {
        UI.toggleLoading(false);
    }
}

async function carregarHistorico() {
    const logs = await HistoryRepository.carregar(AppState.supabaseClient);
    UI.renderHistory(logs, (cnpj) => {
        document.getElementById('cnpjInput').value = cnpj;
        realizarConsulta();
    });
}