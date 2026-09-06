// js/api.js
import { CONFIG } from '../config/config.js';
import { ERROR_MESSAGES } from '../config/constants.js';

export class HttpError extends Error {
    constructor(status, message, responseTimeMs = 0) {
        super(message);
        this.name = 'HttpError';
        this.status = status;
        this.responseTimeMs = responseTimeMs;
    }
}

export const ApiClient = {
    async fetchWithTimeout(url, options = {}) {
        const timeoutMs = CONFIG?.TIMEOUT_MS || 12000;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        
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
                throw new HttpError(408, ERROR_MESSAGES?.TIMEOUT || "Tempo limite esgotado.", responseTimeMs);
            }
            throw new HttpError(0, ERROR_MESSAGES?.NETWORK_ERROR || "Erro de conexão de rede.", responseTimeMs);
        }
    },

    async fetchWithRetry(url, options = {}) {
        let lastError = null;
        const maxRetries = CONFIG?.MAX_RETRIES ?? 2;
        const baseDelay = CONFIG?.RETRY_BACKOFF_BASE_MS ?? 1500;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const result = await this.fetchWithTimeout(url, options);
                if (result.response.ok) return result;

                const status = result.response.status;
                // Backoff apenas para rate limit (429) ou erros de servidor (5xx)
                if (status === 429 || status >= 500) {
                    if (attempt < maxRetries) {
                        const delay = baseDelay * Math.pow(2, attempt);
                        await new Promise(r => setTimeout(r, delay));
                        continue;
                    }
                }
                throw new HttpError(status, `HTTP ${status}: ${result.response.statusText}`, result.responseTimeMs);
            } catch (err) {
                lastError = err;
                // 404 não deve ser retentado
                if (err.status === 404) throw err;
                if (attempt >= maxRetries) throw err;
                
                const delay = baseDelay * Math.pow(2, attempt);
                await new Promise(r => setTimeout(r, delay));
            }
        }
        throw lastError;
    }
};
