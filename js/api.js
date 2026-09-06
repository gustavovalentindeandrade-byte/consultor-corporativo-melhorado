// js/api.js
import { CONFIG } from '../config/config.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';

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
                throw new HttpError(HTTP_STATUS.GATEWAY_TIMEOUT, ERROR_MESSAGES.TIMEOUT, responseTimeMs);
            }
            throw new HttpError(0, ERROR_MESSAGES.NETWORK_ERROR, responseTimeMs);
        }
    },

    async fetchWithRetry(url, options = {}) {
        let lastError = null;
        const maxRetries = CONFIG?.MAX_RETRIES ?? 3;
        const baseDelay = CONFIG?.RETRY_BACKOFF_BASE_MS ?? 1000;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const result = await this.fetchWithTimeout(url, options);
                
                // Sucesso real
                if (result.response.ok) return result;

                const status = result.response.status;
                const errMsg = `HTTP ${status}: ${result.response.statusText || 'Erro'}`;
                lastError = new HttpError(status, errMsg, result.responseTimeMs);

                // Não retenta 404 (CNPJ não existe) ou outros erros 4xx (exceto 429)
                if (status === 404 || (status >= 400 && status < 500 && status !== 429)) {
                    throw lastError;
                }

                // Se for 429 ou 5xx e ainda tiver tentativas, espera e tenta de novo
                if (attempt < maxRetries - 1) {
                    const delay = baseDelay * Math.pow(2, attempt);
                    await new Promise(r => setTimeout(r, delay));
                    continue;
                }
            } catch (err) {
                lastError = err;
                // Se for erro definitivo (como 404), interrompe imediatamente
                if (err.status === 404 || (err.status >= 400 && err.status < 500 && err.status !== 429)) {
                    throw err;
                }
                if (attempt < maxRetries - 1) {
                    const delay = baseDelay * Math.pow(2, attempt);
                    await new Promise(r => setTimeout(r, delay));
                }
            }
        }
        
        throw lastError || new HttpError(500, ERROR_MESSAGES.SERVER_ERROR);
    }
};
