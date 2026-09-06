// js/export.js
import { Utils } from './utils.js';

export const ExportService = {
    copiar(empresa, analise = null) {
        if (!empresa) {
            alert('Nenhuma empresa selecionada para cópia.');
            return;
        }
        
        const cnpjFmt = Utils?.formatCNPJ ? Utils.formatCNPJ(empresa.cnpj) : empresa.cnpj;
        let texto = `CNPJ: ${cnpjFmt}\nRazão Social: ${empresa.razaoSocial || '-'}\nMunicípio/UF: ${empresa.municipio || '-'}/${empresa.uf || '-'}\nAtividade Principal: ${empresa.cnaePrincipalCod || '-'} - ${empresa.cnaePrincipalDesc || '-'}`;
        
        if (analise?.analiseAvancada) {
            const adv = analise.analiseAvancada;
            texto += `\nEmpresa Industrial: ${adv.empresaIndustrial || 'NÃO'}`;
            texto += `\nTotal de CNAEs: ${adv.totalCnaes || 0}`;
            texto += `\nCarteiras: ${Array.isArray(adv.carteiras) && adv.carteiras.length > 0 ? adv.carteiras.join(', ') : '-'}`;
            texto += `\nMacro Setores: ${Array.isArray(adv.macroSetores) && adv.macroSetores.length > 0 ? adv.macroSetores.join(', ') : '-'}`;
        }

        navigator.clipboard.writeText(texto)
            .then(() => alert('Dados copiados para a área de transferência!'))
            .catch(() => alert('Não foi possível copiar automaticamente. Verifique as permissões do navegador.'));
    },

    imprimir() {
        window.print();
    },

    pdf(empresa) {
        const element = document.getElementById('fichaEmpresa') || document.getElementById('resultContainer');
        if (!element) {
            alert('Elemento da ficha não encontrado para geração de PDF.');
            return;
        }
        if (!window.html2pdf) {
            alert('A biblioteca de geração de PDF (html2pdf) ainda não foi carregada. Verifique a conexão.');
            return;
        }
        
        const cnpjLimpo = empresa?.cnpj ? String(empresa.cnpj).replace(/\D/g, '') : 'empresa';
        const opt = {
            margin: 0.4,
            filename: `Ficha_Analise_${cnpjLimpo}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        window.html2pdf().set(opt).from(element).save();
    },

    excelIndividual(empresa, analise = null) {
        if (!empresa) {
            alert('Nenhum dado de empresa disponível para exportar.');
            return;
        }
        if (!window.XLSX) {
            alert('A biblioteca SheetJS (XLSX) não foi carregada.');
            return;
        }
        
        const cnpjFmt = Utils?.formatCNPJ ? Utils.formatCNPJ(empresa.cnpj) : empresa.cnpj;
        const rowData = {
            CNPJ: cnpjFmt,
            Razao_Social: empresa.razaoSocial || '-',
            Nome_Fantasia: empresa.nomeFantasia || '-',
            Situacao: empresa.situacaoCadastral || '-',
            Porte: empresa.porte || '-',
            Municipio_UF: `${empresa.municipio || '-'}/${empresa.uf || '-'}`,
            CNAE_Principal: `${empresa.cnaePrincipalCod || '-'} - ${empresa.cnaePrincipalDesc || '-'}`
        };

        if (analise?.analiseAvancada) {
            const adv = analise.analiseAvancada;
            rowData['Empresa_Industrial'] = adv.empresaIndustrial || 'NÃO';
            rowData['Qtd_CNAEs'] = adv.totalCnaes || 0;
            rowData['Carteiras'] = Array.isArray(adv.carteiras) && adv.carteiras.length > 0 ? adv.carteiras.join(', ') : '-';
            rowData['Macro_Setores'] = Array.isArray(adv.macroSetores) && adv.macroSetores.length > 0 ? adv.macroSetores.join(', ') : '-';
        }

        const ws = window.XLSX.utils.json_to_sheet([rowData]);
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, "Empresa");
        
        const cnpjLimpo = empresa.cnpj ? String(empresa.cnpj).replace(/\D/g, '') : 'export';
        window.XLSX.writeFile(wb, `Dados_Empresa_${cnpjLimpo}.xlsx`);
    },

    excelLote(batchResultsData) {
        if (!Array.isArray(batchResultsData) || batchResultsData.length === 0) {
            alert('Não há dados em lote processados para exportar.');
            return;
        }
        if (!window.XLSX) {
            alert('A biblioteca SheetJS (XLSX) não foi carregada.');
            return;
        }

        const ws = window.XLSX.utils.json_to_sheet(batchResultsData);
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, "Analise_Lote_Base");
        
        const dataHoje = new Date().toISOString().slice(0, 10);
        window.XLSX.writeFile(wb, `Relatorio_Lote_${dataHoje}.xlsx`);
    }
};
