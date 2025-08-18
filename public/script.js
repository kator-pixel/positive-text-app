document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Secure Positive Text Transformer initialized');
    console.log('🔒 API calls are proxied through secure server');
    
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

    // レート制限用のクライアントサイド追跡
    let requestCount = 0;
    let requestTimestamps = [];

    // 初期化時にAPIステータスをチェック
    checkApiStatus();

    async function checkApiStatus() {
        try {
            const response = await fetch('/api/status');
            const status = await response.json();
            console.log('📊 API Status:', status);
            
            if (!status.apiConfigured) {
                showError('サーバーのAPIが正しく設定されていません。管理者にお問い合わせください。');
            }
        } catch (error) {
            console.error('Failed to check API status:', error);
            // サーバーに接続できない場合でも静的にエラーを表示
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
        
        // 5000文字制限
        if (length >= 5000) {
            textInput.value = textInput.value.substring(0, 5000);
            charCount.textContent = 5000;
        }
    }

    // クライアントサイドレート制限チェック
    function checkRateLimit() {
        const now = Date.now();
        const oneMinute = 60 * 1000;
        const maxRequestsPerMinute = 10;
        
        // 1分以上古いタイムスタンプを削除
        requestTimestamps = requestTimestamps.filter(timestamp => now - timestamp < oneMinute);
        
        if (requestTimestamps.length >= maxRequestsPerMinute) {
            return false;
        }
        
        requestTimestamps.push(now);
        return true;
    }

    // ローディング状態表示
    function showLoading() {
        console.log('⏳ Showing loading state');
        submitBtn.disabled = true;
        submitBtnText.textContent = '変換中...';
        submitBtnIcon.style.display = 'none';
        if (loadingIndicator) {
            loadingIndicator.classList.remove('hidden');
        }
        hideError();
        hideSuccess();
    }

    // ローディング状態非表示
    function hideLoading() {
        console.log('✅ Hiding loading state');
        submitBtn.disabled = false;
        submitBtnText.textContent = '変換する';
        submitBtnIcon.style.display = 'inline';
        if (loadingIndicator) {
            loadingIndicator.classList.add('hidden');
        }
    }

    // エラーメッセージ表示
    function showError(message) {
        console.error('❌ Error displayed:', message);
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.classList.remove('hidden');
        }
        hideLoading();
        hideSuccess();
    }

    // エラーメッセージ非表示
    function hideError() {
        if (errorMessage) {
            errorMessage.classList.add('hidden');
        }
    }

    // 成功メッセージ表示
    function showSuccess(message = '✨ 変換が完了しました！') {
        if (successMessage) {
            successMessage.textContent = message;
            successMessage.classList.remove('hidden');
            setTimeout(() => hideSuccess(), 3000);
        }
    }

    // 成功メッセージ非表示
    function hideSuccess() {
        if (successMessage) {
            successMessage.classList.add('hidden');
        }
    }

    // テキスト変換API呼び出し
    async function transformText(text) {
        console.log('🤖 Calling transform API');
        console.log('📝 Input text length:', text.length);

        try {
            const response = await fetch('/api/transform', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text })
            });

            console.log('📨 Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'サーバーエラーが発生しました');
            }

            const data = await response.json();
            console.log('✅ Transform successful');
            return data.transformedText;

        } catch (error) {
            console.error('❌ Transform error:', error);
            throw error;
        }
    }

    // 送信処理
    async function handleSubmit() {
        console.log('🎯 Submit button clicked');
        const inputText = textInput.value.trim();
        
        if (!inputText) {
            showError('変換するテキストを入力してください。');
            return;
        }

        if (inputText.length > 5000) {
            showError('テキストが長すぎます。5000文字以内で入力してください。');
            return;
        }

        // クライアントサイドレート制限チェック
        if (!checkRateLimit()) {
            showError('リクエストが多すぎます。しばらく待ってから再試行してください。');
            return;
        }

        showLoading();

        try {
            const positiveText = await transformText(inputText);
            
            outputText.textContent = positiveText;
            outputSection.classList.remove('hidden');
            
            // アニメーション効果
            outputText.style.animation = 'none';
            setTimeout(() => {
                outputText.style.animation = 'slideUp 0.5s ease-out';
            }, 10);
            
            hideLoading();
            hideError();
            showSuccess();
            
        } catch (error) {
            console.error('❌ Submit error:', error);
            showError(error.message || 'テキストの変換中にエラーが発生しました。');
            outputSection.classList.add('hidden');
        }
    }

    // リセット処理
    function handleReset() {
        console.log('🔄 Reset button clicked');
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
        console.log('📋 Copy button clicked');
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

    // フォールバックコピー機能
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
            console.error('Copy failed:', err);
            showError('コピーに失敗しました。手動でテキストを選択してコピーしてください。');
        }
        
        document.body.removeChild(textArea);
    }

    // イベントリスナー
    submitBtn.addEventListener('click', handleSubmit);
    resetBtn.addEventListener('click', handleReset);
    if (copyBtn) {
        copyBtn.addEventListener('click', handleCopy);
    }
    
    // 文字数カウンター
    textInput.addEventListener('input', updateCharCount);
    
    // Ctrl+Enterで送信
    textInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            console.log('⌨️ Ctrl+Enter pressed');
            handleSubmit();
        }
    });

    // 初期化
    updateCharCount();
    textInput.focus();
    
    console.log('📍 Page loaded successfully');
    console.log('🔒 Security: All API calls are proxied through server');
    console.log('⚡ Features: Rate limiting, character count, copy function enabled');
});