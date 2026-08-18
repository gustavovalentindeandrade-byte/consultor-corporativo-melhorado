import { Utils } from './utils.js';

export const UI = {
    renderHistory(data, onSelectCnpj) {
        const container = document.getElementById('historyPills');
        if (!container) return;
        if (data && data.length > 0) {
            container.innerHTML = data.map(d => 
                `<span class="badge bg-light text-primary border cursor-pointer px-2 py-1" style="cursor:pointer" data-cnpj="${Utils.escapeHtml(d.cnpj)}">${Utils.formatCNPJ(d.cnpj)}</span>`
            ).join('');
            container.querySelectorAll('span').forEach(span => {
                span.addEventListener('click', () => {
                    onSelectCnpj(span.getAttribute('data-cnpj'));
                });
            });
        } else {
            container.innerHTML = '';
        }
    },

    renderFicha(empresa, analise) {
        // Preenchimento dos campos principais (IDs do HTML Otimizado)
        document.getElementById('valCnpj').textContent = Utils.formatCNPJ(empresa.cnpj);
        document.getElementById('valRazaoSocial').textContent = empresa.razaoSocial || '---';
        document.getElementById('valNomeFantasia').textContent = empresa.nomeFantasia || '---';
        document.getElementById('valPorte').textContent = empresa.porte || '---';
        document.getElementById('valPerfil').textContent = analise.perfil;
        document.getElementById('valLocalizacao').textContent = `${empresa.municipio || '-'}/${empresa.uf || '-'}`;
        document.getElementById('valSituacao').textContent = empresa.situacaoCadastral || '-';
        document.getElementById('valAbertura').textContent = Utils.formatDate(empresa.dataAbertura);
        
        // Texto da análise
        const motivacaoEl = document.getElementById('textoMotivacaoIndustrial');
        if (motivacaoEl) {
            motivacaoEl.style.whiteSpace = "pre-line";
            motivacaoEl.textContent = analise.motivacaoIndustrial;
        }

        // Badge de Status Industrial
        const badgeHeader = document.getElementById('badgeIndustrialHeader');
        if (badgeHeader) {
            if (analise.possuiIndustrial) {
                badgeHeader.className = "badge fs-7 px-3 py-2 badge-industrial-yes";
                badgeHeader.innerHTML = `<i class="fa-solid fa-circle-check me-1"></i> Industrial`;
            } else {
                badgeHeader.className = "badge fs-7 px-3 py-2 badge-industrial-no";
                badgeHeader.innerHTML = `<i class="fa-solid fa-circle-xmark me-1"></i> Não Industrial`;
            }
        }

        // Tabela de CNAEs
        const tbody = document.getElementById('listCnaeSecundarioTable');
        if (tbody) {
            tbody.innerHTML = '';
            analise.todasAnalisadas.forEach(item => {
                const tr = document.createElement('tr');
                const badgeTipo = item.tipo === 'Principal' ? '<span class="badge bg-primary">Principal</span>' : '<span class="badge bg-secondary">Secundária</span>';
                const badgeInd = item.isIndustrial ? '<span class="badge bg-success">Sim</span>' : '<span class="badge bg-light text-dark border">Não</span>';
                
                tr.innerHTML = `
                    <td class="ps-4 fw-bold">${Utils.escapeHtml(item.codigo)}</td>
                    <td>${Utils.escapeHtml(item.descricao)}</td>
                    <td>${badgeTipo}</td>
                    <td class="text-center">${badgeInd}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    },

    showAlert(message, type = 'danger') {
        const container = document.getElementById('alertContainer');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-${type} alert-dismissible fade show shadow-sm" role="alert">
                    <i class="fa-solid fa-circle-exclamation me-2"></i> ${Utils.escapeHtml(message)}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>`;
        }
    },

    clearAlert() {
        const container = document.getElementById('alertContainer');
        if (container) container.innerHTML = '';
    },

    toggleLoading(isLoading) {
        const indicator = document.getElementById('loadingIndicator');
        const btn = document.getElementById('btnConsultar');
        if (indicator) indicator.classList.toggle('d-none', !isLoading);
        if (btn) btn.disabled = isLoading;
    },

    toggleResult(hasResult) {
        const result = document.getElementById('resultContainer');
        if (result) result.classList.toggle('d-none', !hasResult);
    }
};
