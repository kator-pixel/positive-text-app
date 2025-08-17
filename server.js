// 安全なバックエンドサーバー - Gemini API プロキシ
// このサーバーはAPIキーをクライアントから完全に隠します
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア設定
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// セキュリティヘッダー
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// レート制限用のインメモリストレージ（本番環境ではRedisを推奨）
const rateLimitMap = new Map();

// レート制限チェック
function checkRateLimit(clientIP) {
    const now = Date.now();
    const oneMinute = 60 * 1000;
    const maxRequestsPerMinute = 10; // 1分間に10リクエストまで
    
    if (!rateLimitMap.has(clientIP)) {
        rateLimitMap.set(clientIP, []);
    }
    
    const timestamps = rateLimitMap.get(clientIP);
    
    // 1分以上古いタイムスタンプを削除
    const recentTimestamps = timestamps.filter(timestamp => now - timestamp < oneMinute);
    
    if (recentTimestamps.length >= maxRequestsPerMinute) {
        return false;
    }
    
    recentTimestamps.push(now);
    rateLimitMap.set(clientIP, recentTimestamps);
    return true;
}

// ルートページの提供
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// APIステータス確認エンドポイント
app.get('/api/status', (req, res) => {
    const apiConfigured = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE');
    res.json({
        status: 'ok',
        apiConfigured,
        timestamp: new Date().toISOString()
    });
});

// 安全なAPIプロキシエンドポイント
app.post('/api/transform', async (req, res) => {
    try {
        const clientIP = req.ip || req.connection.remoteAddress;
        console.log('📡 Transform request from:', clientIP);
        
        // レート制限チェック
        if (!checkRateLimit(clientIP)) {
            console.log('⚠️ Rate limit exceeded for:', clientIP);
            return res.status(429).json({ 
                error: 'リクエストが多すぎます。しばらく待ってから再試行してください。' 
            });
        }
        
        const { text } = req.body;
        
        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: 'テキストが提供されていません' });
        }
        
        if (text.length > 5000) {
            return res.status(400).json({ error: 'テキストが長すぎます（5000文字以内）' });
        }
        
        // 環境変数からAPIキーを取得
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
            console.error('❌ API key not configured');
            return res.status(500).json({ 
                error: 'APIキーが設定されていません。管理者にお問い合わせください。' 
            });
        }

        const prompt = `以下のテキストを、より前向きで心が明るくなるような表現に書き直してください。
本来の意味を保ちながら、ネガティブな感情や状況を成長、学習、またはポジティブな変化の機会として変換してください。
回答は簡潔で励みになるようにしてください。

重要: 必ず日本語で回答してください。

テキスト: ${text}

ポジティブな書き直し:`;

        console.log('🤖 Calling Gemini API...');
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
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
            })
        });

        if (!response.ok) {
            console.error('❌ Gemini API error:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Error response:', errorText);
            
            if (response.status === 429) {
                return res.status(429).json({ 
                    error: 'API制限に達しました。しばらく待ってから再試行してください。' 
                });
            }
            
            return res.status(500).json({ 
                error: 'テキストの変換中にエラーが発生しました。しばらく待ってから再試行してください。' 
            });
        }

        const data = await response.json();
        console.log('✅ Gemini API response received');
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const transformedText = data.candidates[0].content.parts[0].text;
            res.json({ transformedText });
        } else {
            console.error('❌ Invalid response format:', data);
            res.status(500).json({ 
                error: '予期しないレスポンス形式です。再試行してください。' 
            });
        }

    } catch (error) {
        console.error('❌ Server error:', error);
        res.status(500).json({ 
            error: 'サーバーエラーが発生しました。しばらく待ってから再試行してください。' 
        });
    }
});

// エラーハンドリング
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました。' });
});

app.listen(PORT, () => {
    console.log('🚀 Server running on port', PORT);
    console.log('🔒 Security: API key protected with environment variables');
    console.log('⚡ Rate limiting: Enabled');
    console.log('🌐 CORS: Enabled');
});