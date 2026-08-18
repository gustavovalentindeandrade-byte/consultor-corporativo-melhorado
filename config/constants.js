export const ERROR_MESSAGES = Object.freeze({
    NETWORK_ERROR: "Falha de conexão. Verifique sua internet ou tente novamente em instantes.",
    INVALID_CNPJ: "O CNPJ informado possui formato inválido ou dígitos verificadores incorretos.",
    NOT_FOUND: "CNPJ não encontrado na base da Receita Federal (pode ser um registro muito recente).",
    RATE_LIMIT: "Muitas consultas em sequência. O sistema aguardará alguns segundos automaticamente...",
    UNAUTHORIZED: "Chave de acesso expirada ou inválida. Contate o administrador.",
    SERVER_ERROR: "Servidores da Receita Federal instáveis no momento. Tentando via base secundária...",
    TIMEOUT: "A consulta demorou mais que o esperado. Tentando provedor alternativo..."
});

export const HTTP_STATUS = Object.freeze({
    OK: 200,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    TOO_MANY_REQUESTS: 429,
    SERVER_ERROR: 500,
    GATEWAY_TIMEOUT: 504
});

// Função utilitária para converter status em mensagem humana
export const getErrorMessage = (status) => {
    if (status === 404) return ERROR_MESSAGES.NOT_FOUND;
    if (status === 429) return ERROR_MESSAGES.RATE_LIMIT;
    if (status >= 500) return ERROR_MESSAGES.SERVER_ERROR;
    return "Erro inesperado na consulta. Verifique o CNPJ.";
};