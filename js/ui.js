// js/ui.js - Melhoria no renderFicha
renderFicha(empresa, analise) {
    // ... (Preenchimento básico)

    const motivacaoEl = document.getElementById('textoMotivacaoIndustrial');
    if (analise.analiseAvancada && analise.analiseAvancada.totalCnaes > 0) {
        this._renderAnaliseAvancada(analise.analiseAvancada);
    } else {
        // Feedback caso o Supabase falhe ou esteja vazio
        const section = document.getElementById('secaoAnaliseIndustrialAvancada');
        if (section) section.innerHTML = '<div class="alert alert-warning">Aviso: Classificação avançada indisponível no momento.</div>';
    }
}