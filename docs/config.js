// Configuration for GitHub Pages version (Secure)
// Version: 2.0.0 - Cloudflare Worker Proxy
// Updated: 2024-12-19
const CONFIG = {
    // Cloudflare Worker Proxy Endpoint (APIキーは完全に保護されています)
    PROXY_ENDPOINT: 'https://positive-text-api.kato-r.workers.dev/transform',
    
    // 注: APIキーはCloudflare Worker側で安全に管理されます
    
    // Generation Settings
    GENERATION_CONFIG: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
    },
    
    // Rate Limiting (Client-side)
    RATE_LIMIT: {
        maxRequestsPerMinute: 10,
        windowDuration: 60000
    },
    
    // UI Settings
    MAX_INPUT_LENGTH: 5000,
    REQUEST_TIMEOUT: 30000,
    
    // Messages
    MESSAGES: {
        NO_TEXT: 'テキストを入力してください',
        TOO_LONG: 'テキストが長すぎます（5000文字以内）',
        RATE_LIMIT: 'リクエストが多すぎます。しばらく待ってから再試行してください',
        API_ERROR: 'エラーが発生しました。しばらく待ってから再試行してください',
        NETWORK_ERROR: 'ネットワークエラーが発生しました',
        SUCCESS: '✨ 変換が完了しました！'
    }
};