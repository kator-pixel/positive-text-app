# 🚀 クイックデプロイガイド - 5分で公開！

## Railway で即座に公開する方法（最も簡単）

### ステップ1: Railwayアカウント作成
1. https://railway.app にアクセス
2. GitHubアカウントでログイン

### ステップ2: プロジェクト作成
1. 「New Project」をクリック
2. 「Deploy from GitHub repo」を選択
3. `positive-text-app`リポジトリを選択

### ステップ3: 環境変数設定（重要！）
1. プロジェクトダッシュボードで「Variables」タブを開く
2. 「+ New Variable」をクリック
3. 以下を追加：
   - Key: `GEMINI_API_KEY`
   - Value: `あなたの実際のAPIキー`

### ステップ4: デプロイ
1. 自動的にデプロイが開始されます
2. 2-3分待つ
3. 「Settings」タブで生成されたURLをクリック

## 🎉 完了！
これでアプリが `https://your-app-name.up.railway.app` で公開されます！

---

## 代替オプション: Render.com（無料）

### ステップ1: Renderアカウント作成
1. https://render.com にアクセス
2. GitHubアカウントでログイン

### ステップ2: 新しいWebサービス作成
1. 「New +」→「Web Service」
2. GitHubリポジトリを接続
3. `positive-text-app`を選択

### ステップ3: 設定
- Name: `positive-text-app`
- Environment: `Node`
- Build Command: `npm install`
- Start Command: `npm start`

### ステップ4: 環境変数追加
1. 「Environment」タブ
2. 「Add Environment Variable」
3. `GEMINI_API_KEY` = `あなたのAPIキー`

### ステップ5: デプロイ
1. 「Create Web Service」をクリック
2. 5分程度待つ
3. URLが生成されたらアクセス

---

## 💡 APIキーがない場合

1. https://aistudio.google.com/app/apikey にアクセス
2. 「Create API Key」をクリック
3. 生成されたキーをコピー
4. 上記の環境変数に設定

---

## ✅ 動作確認

1. デプロイされたURLにアクセス
2. テキストを入力
3. 「変換する」をクリック
4. ポジティブな結果が表示されれば成功！

## 🔧 トラブルシューティング

**「APIキーが設定されていません」エラー**
→ 環境変数が正しく設定されているか確認

**「Application Error」**
→ ログを確認（Railway: Deployments → View Logs）

**ビルドエラー**
→ package.jsonが正しいか確認