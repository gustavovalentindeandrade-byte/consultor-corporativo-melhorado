import { CONFIG } from '../config/config.js';

export const CacheManager = {
    _prefix: 'cnpj_cache_',

    _getKey(cnpj) {
        return `${this._prefix}${cnpj}`;
    },

    get(cnpj) {
        try {
            const raw = localStorage.getItem(this._getKey(cnpj));
            if (!raw) return null;

            const item = JSON.parse(raw);
            const now = Date.now();

            // Verifica expiração
            if (now - item.timestamp > CONFIG.CACHE_TTL_MS) {
                this.remove(cnpj);
                return null;
            }
            return item.data;
        } catch (err) {
            return null;
        }
    },

    set(cnpj, data) {
        try {
            // Antes de salvar, limpa itens expirados para liberar espaço
            this.prune();

            const item = {
                timestamp: Date.now(),
                data: data
            };
            localStorage.setItem(this._getKey(cnpj), JSON.stringify(item));
        } catch (err) {
            // Se der erro de cota cheia, limpa todo o cache e tenta salvar o último
            if (err.name === 'QuotaExceededError') {
                this.clearAll();
                try { localStorage.setItem(this._getKey(cnpj), JSON.stringify({ timestamp: Date.now(), data })); } catch(e) {}
            }
        }
    },

    remove(cnpj) {
        localStorage.removeItem(this._getKey(cnpj));
    },

    // Remove todos os itens que começam com o prefixo e que expiraram
    prune() {
        const now = Date.now();
        const keys = Object.keys(localStorage);
        let count = 0;

        keys.forEach(key => {
            if (key.startsWith(this._prefix)) {
                try {
                    const item = JSON.parse(localStorage.getItem(key));
                    if (now - item.timestamp > CONFIG.CACHE_TTL_MS) {
                        localStorage.removeItem(key);
                    }
                    count++;
                } catch(e) { localStorage.removeItem(key); }
            }
        });

        // Se ainda houver muitos itens, remove os 10% mais antigos (Lógica de segurança)
        if (count > CONFIG.MAX_CACHE_ITEMS) {
            this.clearAll(); 
        }
    },

    clearAll() {
        Object.keys(localStorage)
            .filter(key => key.startsWith(this._prefix))
            .forEach(key => localStorage.removeItem(key));
    }
};