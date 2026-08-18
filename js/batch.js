// js/batch.js - Trecho Melhorado
const executarProximo = async () => {
    if (index >= cnpjs.length) return;
    // ...
    try {
        const empresa = await CnpjService.consultar(raw);
        // Pequena pausa de 300ms entre sucessos para não sobrecarregar o navegador
        await new Promise(r => setTimeout(r, 300)); 
        // ... rest
    } catch (err) {
        // Se for erro de limite, espera mais tempo
        if (err.message.includes('429')) await new Promise(r => setTimeout(r, 2000));
        onRowComplete(formatted, null, null, 'Erro', err.message);
    }
}