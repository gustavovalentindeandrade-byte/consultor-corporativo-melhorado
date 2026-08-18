// js/api.js
import { CONFIG } from '../config/config.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';

export const ApiClient = {
    async fetchWithTimeout(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_MS);
        
        const startTime = performance.now();
        try {
            const response = await fetch(url, { ...options, signal: controller.signal });
            const responseTimeMs = Math.round(performance.now() - startTime);
            clearTimeout(timeoutId);
            return { response, responseTimeMs };
        } catch (error) {
            clearTimeout(timeoutId);
            const responseTimeMs = Math.round(performance.now() - startTime);
            if (error.name === 'AbortError') {
                throw { message: ERROR_MESSAGES.TIMEOUT, isTimeout: true, responseTimeMs };
            }
            throw { message: ERROR_MESSAGES.NETWORK_ERROR, isNetworkError: true, responseTimeMs };
        }
    },

    async fetchWithRetry(url, options = {}) {
        let lastError = null;
        for (let attempt = 0; attempt < CONFIG.MAX_RETRIES; attempt++) {
            try {
                const result = await this.fetchWithTimeout(url, options);
                if (result.response.ok) return result; // SUCESSO REAL

                // Se chegou aqui, o status é de erro (404, 429, 500...)
                const status = result.response.status;
                if (status === 429 || status >= 500) {
                    const delay = CONFIG.RETRY_BACKOFF_BASE_MS * Math.pow(2, attempt);
                    await new Promise(r => setTimeout(r, delay));
                    continue;
                }
                throw { status, message: `Erro HTTP: ${status}` };
            } catch (err) {
                lastError = err;
                if (err.status && err.status < 500 && err.status !== 429) throw err;
            }
        }
        throw lastError;
    }
};