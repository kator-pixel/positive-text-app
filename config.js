// Configuration for Gemini API
const CONFIG = {
    // Replace with your actual API key from Google AI Studio
    // Get your API key from: https://aistudio.google.com/app/apikey
    GEMINI_API_KEY: 'AIzaSyClK88BePIU8Hp9wJtdByrDk9X1PE7oc-U',
    
    // API endpoint for Gemini Pro (v1beta format)
    // Using the correct endpoint format for Google AI Studio
    GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    
    // Alternative endpoints to try if the above doesn't work
    ALTERNATIVE_ENDPOINTS: {
        gemini_pro: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        gemini_1_5_pro: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
        gemini_1_5_flash: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent'
    },
    
    // API settings
    API_SETTINGS: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
    },
    
    // Rate limiting settings
    RATE_LIMIT: {
        maxRequestsPerMinute: 60,
        retryDelay: 1000, // milliseconds
        maxRetries: 3
    },
    
    // Timeout settings
    REQUEST_TIMEOUT: 30000, // 30 seconds
    
    // Error messages
    ERROR_MESSAGES: {
        API_KEY_MISSING: 'API key is not configured. Please add your Gemini API key in config.js',
        NETWORK_ERROR: 'Unable to connect to the API. Please check your internet connection and try again.',
        RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
        TIMEOUT: 'The request took too long. Please try again with shorter text.',
        GENERIC: 'Something went wrong. Please try again later.',
        INVALID_RESPONSE: 'Received an invalid response from the API. Please try again.',
        MODEL_NOT_FOUND: 'The AI model endpoint was not found. Please check the console for details.'
    }
};

// Validate API key on load
if (CONFIG.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    console.warn('Please configure your Gemini API key in config.js');
}