// Configuration for GitHub Pages version
const CONFIG = {
    // Gemini API Key - 本番用
    GEMINI_API_KEY: 'AIzaSyDRDRxCcgGJ_H46VLIGKUPqCAtSnJzu0Z4',
    
    // API Settings
    API_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    
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