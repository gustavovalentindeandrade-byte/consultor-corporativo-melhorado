// /js/main.js

function renderizarResultados(data) {
    // ... SUA LÓGICA EXISTENTE AQUI ...

    // --- NOVA RENDERIZAÇÃO DO ENQUADRAMENTO ---
    if (data.enquadramentoSindical) {
        const enq = data.enquadramentoSindical;
        const container = document.getElementById('enquadramento-sindical'); // Certifique-se de ter essa div no HTML
        
        let corStatus = '#dc3545'; // vermelho (Não identificado)
        if (enq.status === 'Enquadrado') corStatus = '#28a745'; // verde
        if (enq.status === 'Análise necessária') corStatus = '#ffc107'; // amarelo

        // Constrói as linhas da tabela de auditoria
        const linhasTabela = enq.cnaesAnalisados.map(cnae => `
            <tr style="border-bottom: 1px solid #eee;">
                <td>${cnae.cnae}</td>
                <td>${cnae.tipo}</td>
                <td style="font-size: 0.9em; color: #555;">${cnae.descricao.substring(0, 45)}...</td>
                <td>${cnae.sindicato}</td>
                <td>${cnae.regraUtilizada}</td>
                <td>
                    <span style="color: ${cnae.status === 'Enquadrado' ? 'green' : 'gray'}; font-weight: bold;">
                        ${cnae.status}
                    </span>
                </td>
            </tr>
        `).join('');

        // Monta o HTML final
        container.innerHTML = `
            <div style="margin-top: 20px; padding: 15px; border: 1px solid #ccc; border-radius: 8px; background-color: #f9f9f9;">
                <h4 style="margin-top: 0; color: #333;">🏛️ Enquadramento Sindical</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                    <div>
                        <p style="margin: 5px 0;"><strong>Status:</strong> <span style="background-color: ${corStatus}; color: white; padding: 3px 8px; border-radius: 4px;">${enq.status}</span></p>
                        <p style="margin: 5px 0;"><strong>Sindicato:</strong> ${enq.sindicato || 'Nenhum'}</p>
                        <p style="margin: 5px 0;"><strong>Base / Sigla:</strong> ${enq.baseTerritorial}</p>
                    </div>
                    <div>
                        <p style="margin: 5px 0;"><strong>CNAE Enquadrado:</strong> ${enq.cnaeEnquadrado || '-'}</p>
                        <p style="margin: 5px 0;"><strong>Tipo / Regra:</strong> ${enq.tipoCnae || '-'} / ${enq.regraUtilizada}</p>
                        <p style="margin: 5px 0; font-size: 0.9em; color: #666;"><strong>Motivo:</strong> ${enq.motivo}</p>
                    </div>
                </div>

                <h5 style="margin-bottom: 10px; color: #444;">Auditoria de CNAEs Analisados</h5>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9em;">
                        <thead>
                            <tr style="background-color: #e9ecef;">
                                <th style="padding: 8px;">CNAE</th>
                                <th style="padding: 8px;">Tipo</th>
                                <th style="padding: 8px;">Descrição</th>
                                <th style="padding: 8px;">Sindicato Resultante</th>
                                <th style="padding: 8px;">Regra Localidade</th>
                                <th style="padding: 8px;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${linhasTabela}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
}
