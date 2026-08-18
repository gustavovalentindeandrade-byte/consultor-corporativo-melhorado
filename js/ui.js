// js/ui.js
import { Utils } from './utils.js';

export const UI = {
    renderHistory(data, onSelectCnpj) {
        const container = document.getElementById('historyPills');
        if (!container) return;
        if (data && data.length > 0) {
            container.innerHTML = data.map(d => 
                `<span class="badge bg-light text-primary border px-2 py-1" style="cursor:pointer" data-cnpj="${Utils.escapeHtml(d.cnpj)}">${Utils.formatCNPJ(d.cnpj)}</span>`
            ).join('');
            container.querySelectorAll('span').forEach(span => {
                span.addEventListener('click', () => onSelectCnpj(span.getAttribute('data-cnpj')));
            });
        }
    },

    renderFicha(empresa, analise) {
        // Preenchimento de texto
        document.getElementById('valCnpj').textContent = Utils.formatCNPJ(empresa.cnpj);
        document.getElementById('valRazaoSocial').textContent = empresa.razaoSocial || '---';
        document.getElementById('valNomeFantasia').textContent = empresa.nomeFantasia || '---';
        document.getElementById('valPorte').textContent = empresa.porte || '---';
        document.getElementById('valPerfil').textContent = analise.perfil;
        document.getElementById('valLocalizacao').textContent = `${empresa.municipio || '-'}/${empresa.uf || '-'}`;
        document.getElementById('valSituacao').textContent = empresa.situacaoCadastral || '-';
        document.getElementById('valAbertura').textContent = Utils.formatDate(empresa.dataAbertura);
        document.getElementById('textoMotivacaoIndustrial').textContent = analise.motivacaoIndustrial;

        // Badge Industrial
        const badgeHeader = document.getElementById('badgeIndustrialHeader');
        if (badgeHeader) {
            badgeHeader.className = analise.possuiIndustrial ? "badge badge-industrial-yes px-3 py-2" : "badge badge-industrial-no px-3 py-2";
            badgeHeader.innerHTML = analise.possuiIndustrial ? `<i class="fa-solid fa-check me-1"></i> Industrial` : `<i class="fa-solid fa-xmark me-1"></i> Não Industrial`;
        }

        // Tabela
        const tbody = document.getElementById('listCnaeSecundarioTable');
        if (tbody) {
            tbody.innerHTML = analise.todasAnalisadas.map(item => `
                <tr>
                    <td class="ps-4 fw-bold">${Utils.escapeHtml(item.codigo)}</td>
                    <td>${Utils.escapeHtml(item.descricao)}</td>
                    <td><span class="badge ${item.tipo === 'Principal' ? 'bg-primary' : 'bg-secondary'}">${item.tipo}</span></td>
                    <td class="text-center"><span class="badge ${item.isIndustrial ? 'bg-success' : 'bg-light text-dark border'}">${item.isIndustrial ? 'Sim' : 'Não'}</span></td>
                </tr>
            `).join('');
        }
    },

    showAlert(message, type = 'danger') {
        const container = document.getElementById('alertContainer');
        if (container) {
            container.innerHTML = `<div class="alert alert-${type} shadow-sm border-0"><i class="fa-solid fa-circle-exclamation me-2"></i> ${Utils.escapeHtml(message)}</div>`;
        }
    },

    clearAlert() {
        const container = document.getElementById('alertContainer');
        if (container) container.innerHTML = '';
    },

    toggleLoading(isLoading) {
        document.getElementById('loadingIndicator')?.classList.toggle('d-none', !isLoading);
        const btn = document.getElementById('btnConsultar');
        if (btn) btn.disabled = isLoading;
    },

    toggleResult(hasResult) {
        document.getElementById('resultContainer')?.classList.toggle('d-none', !hasResult);
    }
};
