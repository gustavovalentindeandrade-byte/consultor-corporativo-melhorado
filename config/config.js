// config/config.js
export const CONFIG = Object.freeze({
    SUPABASE_URL: 'https://avimtkqdcmdnvkvllnpq.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2aW10a3FkY21kbnZrdmxsbnBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5MzI4NjAsImV4cCI6MjEwMTUwODg2MH0.-dm77ElvB7_HogpTY0ZF2_xWKYqYFfYWA55zDWoWSn4',
    
    // Timeouts e Retries
    TIMEOUT_MS: 12000,
    MAX_RETRIES: 3,
    RETRY_BACKOFF_BASE_MS: 1000,
    
    // Cache e Lote (Delay seguro de 600ms para evitar 429 na BrasilAPI)
    CACHE_TTL_MS: 1000 * 60 * 60 * 24, // 24 horas
    BATCH_DELAY_MS: 600,
    BATCH_CONCURRENCY_LIMIT: 1, // Modo sequencial evita bloqueio de IP coletivo
    
    // Limites do LocalStorage
    MAX_CACHE_ITEMS: 500 
});
