// GitHub Pages版 - シンプルで使いやすいバージョン
// Version: 2.0.0 - Cloudflare Worker Proxy Version
// NO API KEY REQUIRED - Secure Proxy
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Positive Text Transformer - Cloudflare Worker Version 2.0.0');
    console.log('✨ APIキー不要！Cloudflare Worker経由で安全に通信');
    console.log('🔒 PROXY_ENDPOINT:', CONFIG.PROXY_ENDPOINT);
    
    // DOM要素
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

    // レート制限用の追跡
    let requestTimestamps = [];

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

    // レート制限チェック
    function checkRateLimit() {
        const now = Date.now();
        const oneMinute = CONFIG.RATE_LIMIT.windowDuration;
        
        // 1分以上古いタイムスタンプを削除
        requestTimestamps = requestTimestamps.filter(timestamp => now - timestamp < oneMinute);
        
        // 制限チェック
        if (requestTimestamps.length >= CONFIG.RATE_LIMIT.maxRequestsPerMinute) {
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

    function showSuccess(message = CONFIG.MESSAGES.SUCCESS) {
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

    // Cloudflare Worker Proxy経由でテキスト変換（セキュア版）
    async function transformTextWithTimeout(text, timeout = CONFIG.REQUEST_TIMEOUT) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            // Cloudflare Workerプロキシにリクエスト
            const response = await fetch(
                CONFIG.PROXY_ENDPOINT,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ text }),
                    signal: controller.signal
                }
            );

            clearTimeout(timeoutId);

            if (response.status === 429) {
                throw new Error('RATE_LIMIT');
            }

            if (!response.ok) {
                console.error('Proxy Error:', response.status, response.statusText);
                throw new Error('API_ERROR');
            }

            const data = await response.json();
            
            if (data.transformedText) {
                return data.transformedText;
            } else if (data.error) {
                console.error('Worker error:', data.error);
                throw new Error('API_ERROR');
            } else {
                throw new Error('INVALID_RESPONSE');
            }

        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('TIMEOUT');
            }
            
            throw error;
        }
    }

    // 送信処理
    async function handleSubmit() {
        const inputText = textInput.value.trim();
        
        if (!inputText) {
            showError(CONFIG.MESSAGES.NO_TEXT);
            return;
        }

        if (inputText.length > CONFIG.MAX_INPUT_LENGTH) {
            showError(CONFIG.MESSAGES.TOO_LONG);
            return;
        }

        if (!checkRateLimit()) {
            showError(CONFIG.MESSAGES.RATE_LIMIT);
            return;
        }

        showLoading();

        try {
            const positiveText = await transformTextWithTimeout(inputText);
            
            // 結果を表示
            outputText.textContent = positiveText;
            outputSection.classList.remove('hidden');
            
            // アニメーション
            outputText.style.animation = 'none';
            setTimeout(() => {
                outputText.style.animation = 'slideUp 0.5s ease-out';
            }, 10);
            
            hideLoading();
            hideError();
            showSuccess();
            
        } catch (error) {
            console.error('Transform error:', error);
            
            let errorMsg = CONFIG.MESSAGES.API_ERROR;
            
            if (error.message === 'RATE_LIMIT') {
                errorMsg = CONFIG.MESSAGES.RATE_LIMIT;
            } else if (error.message === 'TIMEOUT') {
                errorMsg = 'リクエストがタイムアウトしました。もう一度お試しください。';
            } else if (error.message === 'NETWORK_ERROR' || error.name === 'TypeError') {
                errorMsg = CONFIG.MESSAGES.NETWORK_ERROR;
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
            }).catch(() => {
                fallbackCopy(textToCopy);
            });
        } else {
            fallbackCopy(textToCopy);
        }
    }

    // フォールバックコピー
    function fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            copyBtn.textContent = 'コピー完了！';
            copyBtn.classList.add('copied');
            setTimeout(() => {
                copyBtn.textContent = 'コピー';
                copyBtn.classList.remove('copied');
            }, 2000);
        } catch (err) {
            console.error('コピー失敗:', err);
            showError('コピーに失敗しました。手動でテキストを選択してコピーしてください。');
        }
        
        document.body.removeChild(textArea);
    }

    // イベントリスナー
    submitBtn.addEventListener('click', handleSubmit);
    resetBtn.addEventListener('click', handleReset);
    copyBtn.addEventListener('click', handleCopy);
    
    // 文字数カウンター
    textInput.addEventListener('input', updateCharCount);
    
    // Ctrl+Enterで送信
    textInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            handleSubmit();
        }
    });

    // ボタンの透明度調整
    textInput.addEventListener('input', function() {
        if (this.value.trim() && !submitBtn.disabled) {
            submitBtn.style.opacity = '1';
        } else {
            submitBtn.style.opacity = '0.8';
        }
    });

    // 初期化
    updateCharCount();
    textInput.focus();
    
    console.log('✅ アプリケーションが正常に読み込まれました');
    console.log('📍 GitHub Pages: https://kator-pixel.github.io/positive-text-app/');
    console.log('🎯 使い方: テキストを入力して「変換する」をクリック！');
});