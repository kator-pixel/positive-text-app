// GitHub Pages版 - APIキーをユーザーが入力する安全な設計
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Positive Text Transformer - GitHub Pages Version');
    console.log('🔒 APIキーはローカルストレージに安全に保存されます');
    
    // DOM要素
    const apiKeySection = document.getElementById('apiKeySection');
    const mainApp = document.getElementById('mainApp');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
    const changeApiKeyBtn = document.getElementById('changeApiKeyBtn');
    
    const textInput = document.getElementById('textInput');
    const submitBtn = document.getElementById('submitBtn');
    const submitBtnText = submitBtn.querySelector('span');
    const submitBtnIcon = submitBtn.querySelector('svg');
    const outputSection = document.getElementById('outputSection');
    const outputText = document.getElementById('outputText');
    const resetBtn = document.getElementById('resetBtn');
    const copyBtn = document.getElementById('copyBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    const charCount = document.getElementById('charCount');
    const charCounter = document.querySelector('.char-counter');

    // APIキー管理
    const API_KEY_STORAGE_KEY = 'gemini_api_key';
    let currentApiKey = null;

    // 初期化時にAPIキーをチェック
    function initialize() {
        const savedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
        if (savedApiKey) {
            currentApiKey = savedApiKey;
            showMainApp();
        } else {
            showApiKeySection();
        }
    }

    // APIキー入力画面を表示
    function showApiKeySection() {
        apiKeySection.classList.remove('hidden');
        mainApp.classList.add('hidden');
        apiKeyInput.focus();
    }

    // メインアプリを表示
    function showMainApp() {
        apiKeySection.classList.add('hidden');
        mainApp.classList.remove('hidden');
        textInput.focus();
    }

    // APIキーを保存
    function saveApiKey() {
        const apiKey = apiKeyInput.value.trim();
        
        if (!apiKey) {
            showError('APIキーを入力してください');
            return;
        }
        
        if (!apiKey.startsWith('AIza')) {
            showError('無効なAPIキー形式です。Google AI StudioからAPIキーを取得してください。');
            return;
        }
        
        // ローカルストレージに保存
        localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
        currentApiKey = apiKey;
        
        // UIを切り替え
        showMainApp();
        showSuccess('APIキーが設定されました！');
    }

    // APIキーを変更
    function changeApiKey() {
        if (confirm('現在のAPIキーを変更しますか？')) {
            localStorage.removeItem(API_KEY_STORAGE_KEY);
            currentApiKey = null;
            apiKeyInput.value = '';
            showApiKeySection();
        }
    }

    // 文字数カウンター更新
    function updateCharCount() {
        const length = textInput.value.length;
        charCount.textContent = length;
        
        if (length > 4500) {
            charCounter.classList.add('warning');
        } else {
            charCounter.classList.remove('warning');
        }
        
        if (length >= 5000) {
            textInput.value = textInput.value.substring(0, 5000);
            charCount.textContent = 5000;
        }
    }

    // レート制限
    let requestTimestamps = [];
    function checkRateLimit() {
        const now = Date.now();
        const oneMinute = 60 * 1000;
        requestTimestamps = requestTimestamps.filter(timestamp => now - timestamp < oneMinute);
        
        if (requestTimestamps.length >= 10) {
            return false;
        }
        
        requestTimestamps.push(now);
        return true;
    }

    // UI状態管理
    function showLoading() {
        submitBtn.disabled = true;
        submitBtnText.textContent = '変換中...';
        submitBtnIcon.style.display = 'none';
        loadingIndicator.classList.remove('hidden');
        hideError();
        hideSuccess();
    }

    function hideLoading() {
        submitBtn.disabled = false;
        submitBtnText.textContent = '変換する';
        submitBtnIcon.style.display = 'inline';
        loadingIndicator.classList.add('hidden');
    }

    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.classList.remove('hidden');
        }
        hideLoading();
        hideSuccess();
    }

    function hideError() {
        if (errorMessage) {
            errorMessage.classList.add('hidden');
        }
    }

    function showSuccess(message = '✨ 変換が完了しました！') {
        if (successMessage) {
            successMessage.textContent = message;
            successMessage.classList.remove('hidden');
            setTimeout(() => hideSuccess(), 3000);
        }
    }

    function hideSuccess() {
        if (successMessage) {
            successMessage.classList.add('hidden');
        }
    }

    // Gemini API呼び出し
    async function transformText(text) {
        const prompt = `以下のテキストを、より前向きで心が明るくなるような表現に書き直してください。
本来の意味を保ちながら、ネガティブな感情や状況を成長、学習、またはポジティブな変化の機会として変換してください。
回答は簡潔で励みになるようにしてください。

重要: 必ず日本語で回答してください。

テキスト: ${text}

ポジティブな書き直し:`;

        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
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

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${currentApiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody)
                }
            );

            if (response.status === 403 || response.status === 401) {
                throw new Error('API_KEY_INVALID');
            }

            if (response.status === 429) {
                throw new Error('RATE_LIMIT');
            }

            if (!response.ok) {
                throw new Error('API_ERROR');
            }

            const data = await response.json();
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('INVALID_RESPONSE');
            }

        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // 送信処理
    async function handleSubmit() {
        const inputText = textInput.value.trim();
        
        if (!inputText) {
            showError('変換するテキストを入力してください。');
            return;
        }

        if (!currentApiKey) {
            showError('APIキーが設定されていません。');
            showApiKeySection();
            return;
        }

        if (!checkRateLimit()) {
            showError('リクエストが多すぎます。しばらく待ってから再試行してください。');
            return;
        }

        showLoading();

        try {
            const positiveText = await transformText(inputText);
            
            outputText.textContent = positiveText;
            outputSection.classList.remove('hidden');
            
            outputText.style.animation = 'none';
            setTimeout(() => {
                outputText.style.animation = 'slideUp 0.5s ease-out';
            }, 10);
            
            hideLoading();
            hideError();
            showSuccess();
            
        } catch (error) {
            let errorMsg = 'エラーが発生しました。';
            
            if (error.message === 'API_KEY_INVALID') {
                errorMsg = 'APIキーが無効です。正しいキーを設定してください。';
                setTimeout(() => changeApiKey(), 2000);
            } else if (error.message === 'RATE_LIMIT') {
                errorMsg = 'API制限に達しました。しばらく待ってから再試行してください。';
            } else if (error.message === 'API_ERROR') {
                errorMsg = 'APIエラーが発生しました。しばらく待ってから再試行してください。';
            }
            
            showError(errorMsg);
            outputSection.classList.add('hidden');
        }
    }

    // リセット処理
    function handleReset() {
        textInput.value = '';
        outputSection.classList.add('hidden');
        hideError();
        hideSuccess();
        hideLoading();
        updateCharCount();
        textInput.focus();
    }

    // コピー処理
    function handleCopy() {
        const textToCopy = outputText.textContent;
        
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                copyBtn.textContent = 'コピー完了！';
                copyBtn.classList.add('copied');
                setTimeout(() => {
                    copyBtn.textContent = 'コピー';
                    copyBtn.classList.remove('copied');
                }, 2000);
            });
        } else {
            // フォールバック
            const textArea = document.createElement('textarea');
            textArea.value = textToCopy;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            copyBtn.textContent = 'コピー完了！';
            setTimeout(() => {
                copyBtn.textContent = 'コピー';
            }, 2000);
        }
    }

    // イベントリスナー
    saveApiKeyBtn.addEventListener('click', saveApiKey);
    changeApiKeyBtn.addEventListener('click', changeApiKey);
    submitBtn.addEventListener('click', handleSubmit);
    resetBtn.addEventListener('click', handleReset);
    copyBtn.addEventListener('click', handleCopy);
    
    // 文字数カウンター
    textInput.addEventListener('input', updateCharCount);
    
    // Enterキーでも送信
    apiKeyInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            saveApiKey();
        }
    });
    
    // Ctrl+Enterで送信
    textInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            handleSubmit();
        }
    });

    // 初期化
    initialize();
    updateCharCount();
    
    console.log('✅ アプリケーションが正常に読み込まれました');
    console.log('🔒 APIキーはブラウザのローカルストレージに安全に保存されます');
    console.log('📍 GitHub Pages: https://kator-pixel.github.io/positive-text-app/');
});