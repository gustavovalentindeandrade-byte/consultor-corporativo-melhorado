// config/constants.js
export const ERROR_MESSAGES = Object.freeze({
    NETWORK_ERROR: "Falha de conexão. Verifique sua internet ou tente novamente em instantes.",
    INVALID_CNPJ: "O CNPJ informado possui formato inválido ou dígitos verificadores incorretos.",
    NOT_FOUND: "CNPJ não encontrado na base da Receita Federal.",
    RATE_LIMIT: "Limite de requisições por minuto excedido (429). Aguarde alguns segundos...",
    UNAUTHORIZED: "Chave de acesso expirada ou inválida. Contate o administrador.",
    SERVER_ERROR: "Instabilidade nos servidores da Receita/Provedor no momento.",
    TIMEOUT: "A consulta demorou mais que o esperado (tempo limite de 12s esgotado)."
});

export const HTTP_STATUS = Object.freeze({
    OK: 200,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    TOO_MANY_REQUESTS: 429,
    SERVER_ERROR: 500,
    GATEWAY_TIMEOUT: 504
});

export const getErrorMessage = (status) => {
    if (status === 0) return ERROR_MESSAGES.NETWORK_ERROR;
    if (status === 404) return ERROR_MESSAGES.NOT_FOUND;
    if (status === 429) return ERROR_MESSAGES.RATE_LIMIT;
    if (status === 408 || status === 504) return ERROR_MESSAGES.TIMEOUT;
    if (status >= 500) return ERROR_MESSAGES.SERVER_ERROR;
    return "Erro inesperado na consulta. Verifique o CNPJ.";
};
