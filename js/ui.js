import { Utils } from './utils.js';

// FALTAVA ESSA LINHA --> export const UI =
export const UI = {
    renderHistory(data, onSelectCnpj) {
        const container = document.getElementById('historyPills');
        if (!container) return;
        if (data && data.length > 0) {
            container.innerHTML = data.map(d => 
                `<span class="badge bg-light text-dark border cursor-pointer" data-cnpj="${Utils.escapeHtml(d.cnpj)}">${Utils.formatCNPJ(d.cnpj)}</span>`
            ).join('');
            container.querySelectorAll('span').forEach(span => {
                span.addEventListener('click', () => {
                    onSelectCnpj(span.getAttribute('data-cnpj'));
                });
            });
        } else {
            container.innerHTML = '<small class="text-muted fst-italic">Nenhum histórico.</small>';
        }
    },

    renderFicha(empresa, analise) {
        // Mapeamento dos novos IDs do HTML otimizado
        document.getElementById('valCnpj').textContent = Utils.formatCNPJ(empresa.cnpj);
        document.getElementById('valRazaoSocial').textContent = empresa.razaoSocial || '---';
        document.getElementById('valNomeFantasia').textContent = empresa.nomeFantasia || 'Não informado';
        document.getElementById('valPorte').textContent = empresa.porte || 'Não informado';
        document.getElementById('valPerfil').textContent = analise.perfil;
        document.getElementById('valLocalizacao').textContent = `${empresa.municipio || '-'}/${empresa.uf || '-'}`;
        document.getElementById('valSituacao').textContent = empresa.situacaoCadastral || '-';
        document.getElementById('valAbertura').textContent = Utils.formatDate(empresa.dataAbertura);
        document.getElementById('textoMotivacaoIndustrial').textContent = analise.motivacaoIndustrial;

        const badgeHeader = document.getElementById('badgeIndustrialHeader');
        if (analise.possuiIndustrial) {
            badgeHeader.className = "badge fs-7 px-3 py-2 badge-industrial-yes";
            badgeHeader.innerHTML = `<i class="fa-solid fa-circle-check me-1"></i> Industrial`;
        } else {
            badgeHeader.className = "badge fs-7 px-3 py-2 badge-industrial-no";
            badgeHeader.innerHTML = `<i class="fa-solid fa-circle-xmark me-1"></i> Não Industrial`;
        }

        const tbody = document.getElementById('listCnaeSecundarioTable');
        tbody.innerHTML = '';
        
        // Renderiza apenas se houver CNAEs para analisar
        if (analise.todasAnalisadas && analise.todasAnalisadas.length > 0) {
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
        } else {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Nenhuma atividade econômica informada.</td></tr>';
        }
    },

    showAlert(message, type = 'danger') {
        const container = document.getElementById('alertContainer');
        if (container) {
            const icon = type === 'warning' ? 'fa-triangle-exclamation' : 'fa-circle-xmark';
            container.innerHTML = `<div class="alert alert-${type} d-flex align-items-center"><i class="fa-solid ${icon} me-2"></i> ${Utils.escapeHtml(message)}</div>`;
        }
    },

    toggleLoading(isLoading) {
        document.getElementById('loadingIndicator')?.classList.toggle('d-none', !isLoading);
        document.getElementById('btnConsultar')?.toggleAttribute('disabled', isLoading);
    },

    toggleResult(hasResult) {
        document.getElementById('resultContainer')?.classList.toggle('d-none', !hasResult);
    }
};
