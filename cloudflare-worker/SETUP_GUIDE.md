# 🔒 Cloudflare Worker セットアップガイド

APIキーを完全に保護しながら、無料でアプリを公開する方法です。

## 📋 必要なもの

- Cloudflare アカウント（無料）
- Gemini API キー
- 5分程度の時間

## 🚀 セットアップ手順

### ステップ1: Cloudflareアカウント作成

1. [Cloudflare](https://www.cloudflare.com/) にアクセス
2. 「Sign Up」をクリックして無料アカウントを作成

### ステップ2: Worker作成

1. Cloudflareダッシュボードにログイン
2. 左メニューから「Workers & Pages」をクリック
3. 「Create application」をクリック
4. 「Create Worker」を選択
5. 名前を入力（例: `positive-text-api`）
6. 「Deploy」をクリック

### ステップ3: コードをデプロイ

1. 「Edit code」をクリック
2. エディタ内のコードを全て削除
3. `worker.js`の内容を全てコピー＆ペースト
4. 右上の「Save and Deploy」をクリック

### ステップ4: 環境変数（APIキー）を設定

1. Workerのダッシュボードに戻る
2. 「Settings」タブをクリック
3. 「Variables」セクションを探す
4. 「Add variable」をクリック
5. 以下を設定：
   - Variable name: `GEMINI_API_KEY`
   - Value: `あなたのGemini APIキー`
6. 「Save」をクリック

### ステップ5: Worker URLを取得

1. 「Overview」タブに戻る
2. 表示されているURLをコピー
   - 例: `https://positive-text-api.YOUR-SUBDOMAIN.workers.dev`

### ステップ6: GitHub Pagesファイルを更新

1. `docs/config.js`を編集
2. `PROXY_ENDPOINT`をあなたのWorker URLに変更：

```javascript
const CONFIG = {
    // あなたのWorker URLに変更
    PROXY_ENDPOINT: 'https://positive-text-api.YOUR-SUBDOMAIN.workers.dev/transform',
    // ... 他の設定
}
```

3. GitHubにプッシュ

## ✅ 動作確認

1. GitHub Pages URL にアクセス
2. テキストを入力して「変換する」をクリック
3. ポジティブな結果が表示されれば成功！

## 🔒 セキュリティ確認

- ✅ APIキーはCloudflare側でのみ管理
- ✅ GitHub上にAPIキーは一切存在しない
- ✅ ブラウザの開発者ツールでもAPIキーは見えない
- ✅ 完全に安全！

## 📊 使用制限

### 無料枠
- Cloudflare Workers: 100,000リクエスト/日（無料）
- Gemini API: 60リクエスト/分（無料枠）

### レート制限
- Worker側: 1分間に10リクエスト/IP
- 十分な制限で悪用を防止

## 🔧 トラブルシューティング

### 「サーバーエラー」が出る場合
- 環境変数 `GEMINI_API_KEY` が正しく設定されているか確認
- Cloudflare Worker のログを確認

### CORSエラーが出る場合
- Worker URLが正しいか確認
- `/transform` を URL末尾に追加しているか確認

### 「リクエストが多すぎます」エラー
- 1分間に10回以上リクエストしている
- 少し待ってから再試行

## 🎯 カスタマイズ

### 特定のドメインのみ許可する場合

`worker.js`の以下の部分を変更：

```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://your-domain.github.io', // 特定のドメインのみ
  // ...
}
```

### レート制限を変更する場合

```javascript
const maxRequests = 20 // 1分間に20リクエストまで
```

## 📝 まとめ

これで完全に安全な状態でアプリが公開できます！

- 🔒 APIキーは100%保護
- 💰 完全無料
- ⚡ 高速なレスポンス
- 🌍 世界中からアクセス可能

質問があれば [Issues](https://github.com/kator-pixel/positive-text-app/issues) まで！