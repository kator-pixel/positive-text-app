/**
 * Cloudflare Worker - Secure Gemini API Proxy
 * このWorkerはAPIキーを安全に保護しながらGemini APIへのアクセスを提供します
 */

// 環境変数からAPIキーを取得（Cloudflareダッシュボードで設定）
// Workers > Settings > Variables で GEMINI_API_KEY を設定してください

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // 本番環境では特定のドメインに制限してください
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
}

// レート制限用のストレージ（簡易版）
const rateLimitMap = new Map()

// レート制限チェック
function checkRateLimit(clientIP) {
  const now = Date.now()
  const oneMinute = 60 * 1000
  const maxRequests = 10

  if (!rateLimitMap.has(clientIP)) {
    rateLimitMap.set(clientIP, [])
  }

  const timestamps = rateLimitMap.get(clientIP)
  const recentTimestamps = timestamps.filter(ts => now - ts < oneMinute)

  if (recentTimestamps.length >= maxRequests) {
    return false
  }

  recentTimestamps.push(now)
  rateLimitMap.set(clientIP, recentTimestamps)
  return true
}

async function handleRequest(request) {
  // OPTIONS request for CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })
  }

  try {
    // Get client IP for rate limiting
    const clientIP = request.headers.get('CF-Connecting-IP') || 
                     request.headers.get('X-Forwarded-For') || 
                     'unknown'

    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      return new Response(JSON.stringify({ 
        error: 'リクエストが多すぎます。しばらく待ってから再試行してください。' 
      }), {
        status: 429,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      })
    }

    // Parse request body
    const body = await request.json()
    const { text } = body

    // Validate input
    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ 
        error: 'テキストが提供されていません' 
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      })
    }

    if (text.length > 5000) {
      return new Response(JSON.stringify({ 
        error: 'テキストが長すぎます（5000文字以内）' 
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      })
    }

    // Get API key from environment variable
    const apiKey = GEMINI_API_KEY // This is set in Cloudflare Worker settings
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY not configured')
      return new Response(JSON.stringify({ 
        error: 'サーバー設定エラー' 
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      })
    }

    // Create prompt
    const prompt = `以下のテキストを、より前向きで心が明るくなるような表現に書き直してください。
本来の意味を保ちながら、ネガティブな感情や状況を成長、学習、またはポジティブな変化の機会として変換してください。
回答は簡潔で励みになるようにしてください。

重要: 必ず日本語で回答してください。

テキスト: ${text}

ポジティブな書き直し:`

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
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
      }
    )

    // Check response status
    if (geminiResponse.status === 429) {
      return new Response(JSON.stringify({ 
        error: 'API制限に達しました。しばらく待ってから再試行してください。' 
      }), {
        status: 429,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      })
    }

    if (!geminiResponse.ok) {
      console.error('Gemini API error:', geminiResponse.status, geminiResponse.statusText)
      return new Response(JSON.stringify({ 
        error: 'テキストの変換中にエラーが発生しました' 
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      })
    }

    // Parse Gemini response
    const geminiData = await geminiResponse.json()
    
    if (geminiData.candidates && geminiData.candidates[0] && geminiData.candidates[0].content) {
      const transformedText = geminiData.candidates[0].content.parts[0].text
      
      return new Response(JSON.stringify({ 
        transformedText 
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      })
    } else {
      return new Response(JSON.stringify({ 
        error: '予期しないレスポンス形式です' 
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      })
    }

  } catch (error) {
    console.error('Worker error:', error)
    return new Response(JSON.stringify({ 
      error: 'サーバーエラーが発生しました' 
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })
  }
}