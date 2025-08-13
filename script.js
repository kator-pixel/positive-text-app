document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Application initialized');
    console.log('📋 Config loaded:', {
        apiKeyLength: CONFIG.GEMINI_API_KEY ? CONFIG.GEMINI_API_KEY.length : 0,
        apiUrl: CONFIG.GEMINI_API_URL,
        settings: CONFIG.API_SETTINGS
    });

    const textInput = document.getElementById('textInput');
    const submitBtn = document.getElementById('submitBtn');
    const submitBtnText = submitBtn.querySelector('span');
    const submitBtnIcon = submitBtn.querySelector('svg');
    const outputSection = document.getElementById('outputSection');
    const outputText = document.getElementById('outputText');
    const resetBtn = document.getElementById('resetBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorMessage = document.getElementById('errorMessage');

    // Rate limiting tracking
    let requestCount = 0;
    let requestTimestamps = [];

    // Check if API key is configured
    function isApiKeyConfigured() {
        const configured = CONFIG.GEMINI_API_KEY && CONFIG.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE';
        console.log('🔑 API Key configured:', configured);
        if (configured) {
            console.log('🔑 API Key preview:', CONFIG.GEMINI_API_KEY.substring(0, 10) + '...');
        }
        return configured;
    }

    // Rate limiting check
    function checkRateLimit() {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        
        // Remove timestamps older than 1 minute
        requestTimestamps = requestTimestamps.filter(timestamp => timestamp > oneMinuteAgo);
        
        // Check if we've exceeded the rate limit
        const canProceed = requestTimestamps.length < CONFIG.RATE_LIMIT.maxRequestsPerMinute;
        console.log('⏱️ Rate limit check:', {
            currentRequests: requestTimestamps.length,
            maxRequests: CONFIG.RATE_LIMIT.maxRequestsPerMinute,
            canProceed: canProceed
        });
        
        if (canProceed) {
            requestTimestamps.push(now);
        }
        
        return canProceed;
    }

    // Show loading state
    function showLoading() {
        console.log('⏳ Showing loading state');
        submitBtn.disabled = true;
        submitBtnText.textContent = 'Transforming...';
        submitBtnIcon.style.display = 'none';
        if (loadingIndicator) {
            loadingIndicator.classList.remove('hidden');
        }
        hideError();
    }

    // Hide loading state
    function hideLoading() {
        console.log('✅ Hiding loading state');
        submitBtn.disabled = false;
        submitBtnText.textContent = 'Transform';
        submitBtnIcon.style.display = 'inline';
        if (loadingIndicator) {
            loadingIndicator.classList.add('hidden');
        }
    }

    // Show error message
    function showError(message) {
        console.error('❌ Error displayed:', message);
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.classList.remove('hidden');
        } else {
            // Fallback to alert if error element doesn't exist
            alert(message);
        }
        hideLoading();
    }

    // Hide error message
    function hideError() {
        if (errorMessage) {
            errorMessage.classList.add('hidden');
        }
    }

    // Test API connection with a simple call
    async function testApiConnection(endpointOverride = null) {
        console.log('🧪 Testing API connection...');
        
        // Simplified test request for Gemini API
        const testRequest = {
            contents: [{
                parts: [{
                    text: "Hello"
                }]
            }]
        };

        const endpoint = endpointOverride || CONFIG.GEMINI_API_URL;
        const url = `${endpoint}?key=${CONFIG.GEMINI_API_KEY}`;
        console.log('📡 Test URL:', url.replace(CONFIG.GEMINI_API_KEY, 'API_KEY_HIDDEN'));
        console.log('📡 Endpoint being tested:', endpoint.split('/').pop());
        console.log('📦 Test request body:', JSON.stringify(testRequest, null, 2));

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testRequest)
            });

            console.log('📨 Test response status:', response.status, response.statusText);
            console.log('📨 Test response headers:', Object.fromEntries(response.headers.entries()));

            const responseText = await response.text();
            console.log('📄 Raw response text:', responseText);
            
            let data;
            try {
                data = JSON.parse(responseText);
                console.log('📨 Parsed response data:', JSON.stringify(data, null, 2));
            } catch (e) {
                console.error('Failed to parse JSON:', e);
                console.log('Response was:', responseText);
                return false;
            }

            if (response.status === 404) {
                console.error('❌ 404 Error - Endpoint not found. The model might not be available.');
                console.log('💡 Try using a different model endpoint from CONFIG.ALTERNATIVE_ENDPOINTS');
                return false;
            }

            if (response.status === 400 && data.error?.message) {
                console.error('❌ 400 Error:', data.error.message);
                if (data.error.message.includes('API key')) {
                    console.error('🔑 API key issue detected. Check your key format.');
                }
                return false;
            }

            if (response.ok && data.candidates) {
                console.log('✅ API test successful!');
                console.log('✨ Model response:', data.candidates[0]?.content?.parts?.[0]?.text || 'No text in response');
                return true;
            } else {
                console.error('❌ API test failed:', data);
                return false;
            }
        } catch (error) {
            console.error('❌ API test error:', error);
            console.error('Error type:', error.name);
            console.error('Error message:', error.message);
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                console.error('🔌 This might be a CORS issue or network problem');
            }
            return false;
        }
    }

    // Test all available endpoints to find a working one
    async function testAllEndpoints() {
        console.log('🔍 Testing all available endpoints...');
        
        const endpoints = [
            { name: 'Default', url: CONFIG.GEMINI_API_URL },
            ...Object.entries(CONFIG.ALTERNATIVE_ENDPOINTS || {}).map(([name, url]) => ({ name, url }))
        ];
        
        for (const endpoint of endpoints) {
            console.log(`\n🧪 Testing ${endpoint.name}: ${endpoint.url.split('/').pop()}`);
            const success = await testApiConnection(endpoint.url);
            if (success) {
                console.log(`✅ ${endpoint.name} endpoint works!`);
                return endpoint.url;
            }
        }
        
        console.error('❌ No working endpoints found');
        return null;
    }

    // Create API request with timeout
    async function fetchWithTimeout(url, options, timeout = CONFIG.REQUEST_TIMEOUT) {
        console.log('⏰ Setting timeout:', timeout, 'ms');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                console.error('⏰ Request timeout after', timeout, 'ms');
                throw new Error('Request timeout');
            }
            console.error('🔌 Fetch error:', error);
            throw error;
        }
    }

    // Call Gemini API to transform text
    async function transformWithGemini(text, retryCount = 0) {
        console.log('🤖 Starting Gemini transformation');
        console.log('📝 Input text:', text);
        console.log('🔄 Retry count:', retryCount);

        const prompt = `Please rewrite the following text in a more positive, uplifting way while maintaining its core meaning. Transform any negative emotions or situations into opportunities for growth, learning, or positive change. Keep the response concise and encouraging.

Text: ${text}

Positive rewrite:`;

        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: CONFIG.API_SETTINGS.temperature,
                topK: CONFIG.API_SETTINGS.topK,
                topP: CONFIG.API_SETTINGS.topP,
                maxOutputTokens: CONFIG.API_SETTINGS.maxOutputTokens,
                stopSequences: []
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        };

        const url = `${CONFIG.GEMINI_API_URL}?key=${CONFIG.GEMINI_API_KEY}`;
        
        console.log('📡 API URL:', url.replace(CONFIG.GEMINI_API_KEY, 'API_KEY_HIDDEN'));
        console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));

        try {
            const startTime = Date.now();
            const response = await fetchWithTimeout(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });
            
            const responseTime = Date.now() - startTime;
            console.log('⏱️ Response time:', responseTime, 'ms');
            console.log('📨 Response status:', response.status);
            console.log('📨 Response status text:', response.statusText);
            console.log('📨 Response headers:', Object.fromEntries(response.headers.entries()));

            if (response.status === 404) {
                console.error('❌ 404 Error - Model endpoint not found');
                console.log('🔄 Attempting to find a working endpoint...');
                const workingEndpoint = await testAllEndpoints();
                if (workingEndpoint && retryCount === 0) {
                    CONFIG.GEMINI_API_URL = workingEndpoint;
                    console.log('🔄 Retrying with working endpoint...');
                    return transformWithGemini(text, retryCount + 1);
                }
                throw new Error('MODEL_NOT_FOUND');
            }

            if (response.status === 429) {
                console.warn('⚠️ Rate limit hit, retry count:', retryCount);
                // Rate limit exceeded
                if (retryCount < CONFIG.RATE_LIMIT.maxRetries) {
                    const delay = CONFIG.RATE_LIMIT.retryDelay * (retryCount + 1);
                    console.log('⏳ Waiting', delay, 'ms before retry...');
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return transformWithGemini(text, retryCount + 1);
                }
                throw new Error('RATE_LIMIT');
            }

            const responseText = await response.text();
            console.log('📄 Raw response:', responseText);

            let data;
            try {
                data = JSON.parse(responseText);
                console.log('📊 Parsed response:', JSON.stringify(data, null, 2));
            } catch (parseError) {
                console.error('❌ Failed to parse response:', parseError);
                console.error('📄 Response that failed to parse:', responseText);
                throw new Error('INVALID_RESPONSE');
            }

            if (!response.ok) {
                console.error('❌ API error response:', data);
                
                if (response.status === 400) {
                    if (data.error?.message?.includes('API_KEY') || 
                        data.error?.message?.includes('API key')) {
                        console.error('🔑 API key issue detected');
                        throw new Error('API_KEY_INVALID');
                    }
                }
                
                throw new Error(`API_ERROR_${response.status}`);
            }

            // Extract the generated text from the response
            if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                const generatedText = data.candidates[0].content.parts[0].text.trim();
                console.log('✨ Generated text:', generatedText);
                console.log('📊 Token usage:', data.usageMetadata);
                return generatedText;
            } else {
                console.error('❌ Unexpected response structure:', data);
                throw new Error('INVALID_RESPONSE');
            }

        } catch (error) {
            console.error('❌ Gemini API Error:', error);
            console.error('Stack trace:', error.stack);
            
            // Handle specific error types
            if (error.message === 'Request timeout') {
                throw new Error('TIMEOUT');
            } else if (error.message === 'RATE_LIMIT') {
                throw new Error('RATE_LIMIT');
            } else if (error.message === 'API_KEY_INVALID') {
                throw new Error('API_KEY_MISSING');
            } else if (error.message === 'INVALID_RESPONSE') {
                throw new Error('INVALID_RESPONSE');
            } else if (error.message.startsWith('API_ERROR_')) {
                throw new Error('GENERIC');
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                console.error('🔌 Network error detected');
                throw new Error('NETWORK_ERROR');
            }
            
            throw error;
        }
    }

    // Handle submit
    async function handleSubmit() {
        console.log('🎯 Submit button clicked');
        const inputText = textInput.value.trim();
        
        if (!inputText) {
            showError('Please enter some text to transform!');
            return;
        }

        console.log('📝 Processing input:', inputText);

        // Check if API key is configured
        if (!isApiKeyConfigured()) {
            showError(CONFIG.ERROR_MESSAGES.API_KEY_MISSING);
            return;
        }

        // Check rate limit
        if (!checkRateLimit()) {
            showError(CONFIG.ERROR_MESSAGES.RATE_LIMIT);
            return;
        }

        showLoading();

        try {
            console.log('🚀 Starting transformation...');
            const positiveText = await transformWithGemini(inputText);
            
            console.log('✅ Transformation successful');
            outputText.textContent = positiveText;
            outputSection.classList.remove('hidden');
            
            // Animate the output
            outputText.style.animation = 'none';
            setTimeout(() => {
                outputText.style.animation = 'slideUp 0.5s ease-out';
            }, 10);
            
            hideLoading();
            hideError();
            
        } catch (error) {
            console.error('❌ Transform error:', error);
            
            // Map error to user-friendly message
            const errorKey = error.message || 'GENERIC';
            const userMessage = CONFIG.ERROR_MESSAGES[errorKey] || CONFIG.ERROR_MESSAGES.GENERIC;
            
            showError(userMessage);
            outputSection.classList.add('hidden');
        }
    }

    // Handle reset
    function handleReset() {
        console.log('🔄 Reset button clicked');
        textInput.value = '';
        outputSection.classList.add('hidden');
        hideError();
        hideLoading();
        textInput.focus();
    }

    // Add debug button for API test
    function addDebugButton() {
        const debugBtn = document.createElement('button');
        debugBtn.textContent = '🧪 Test API';
        debugBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 10px 20px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            z-index: 1000;
        `;
        debugBtn.onclick = async () => {
            console.log('🧪 Debug test initiated');
            const success = await testApiConnection();
            if (success) {
                alert('✅ API connection successful! Check console for details.');
            } else {
                alert('❌ API connection failed! Testing alternative endpoints...');
                const workingEndpoint = await testAllEndpoints();
                if (workingEndpoint) {
                    CONFIG.GEMINI_API_URL = workingEndpoint;
                    alert('✅ Found working endpoint: ' + workingEndpoint.split('/').pop());
                } else {
                    alert('❌ No working endpoints found. Check console for details.');
                }
            }
        };
        document.body.appendChild(debugBtn);
    }

    // Event listeners
    submitBtn.addEventListener('click', handleSubmit);
    resetBtn.addEventListener('click', handleReset);
    
    // Ctrl+Enter to submit
    textInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            console.log('⌨️ Ctrl+Enter pressed');
            handleSubmit();
        }
    });

    // Update button opacity based on input
    textInput.addEventListener('input', function() {
        if (this.value.trim() && !submitBtn.disabled) {
            submitBtn.style.opacity = '1';
        } else {
            submitBtn.style.opacity = '0.8';
        }
    });

    // Initial check for API key
    if (!isApiKeyConfigured()) {
        console.warn('⚠️ Gemini API key is not configured. Please add your API key in config.js');
        const warning = document.createElement('div');
        warning.className = 'api-key-warning';
        warning.innerHTML = `
            🔑 API key not configured! 
            <a href="https://aistudio.google.com/app/apikey" target="_blank">Get your API key</a> 
            and add it to config.js
        `;
        document.querySelector('.container main').insertBefore(warning, document.querySelector('.input-section'));
    }

    // Add debug button
    addDebugButton();

    // Log initial page load info
    console.log('📍 Page URL:', window.location.href);
    console.log('🌐 User Agent:', navigator.userAgent);
    console.log('📅 Timestamp:', new Date().toISOString());
    
    // Run initial API test
    console.log('🏁 Running initial API test...');
    testApiConnection().then(success => {
        if (success) {
            console.log('✅ Initial API test passed');
        } else {
            console.log('❌ Initial API test failed - check your API key');
        }
    });
});