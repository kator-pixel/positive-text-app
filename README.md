# 🌟 Positive Text Transformer - セキュア版

**APIキーを完全に保護した安全なポジティブテキスト変換アプリ**

ネガティブな文章を前向きで明るい表現に変換するWebアプリケーションです。Google Gemini AIを使用し、セキュリティを最優先に設計されています。

## 🔒 セキュリティ特徴

- **APIキー完全保護**: クライアントサイドにAPIキーが一切露出しない
- **プロキシサーバー**: 全てのAPI呼び出しがサーバー経由
- **環境変数管理**: 機密情報は環境変数で安全に管理
- **レート制限**: 悪用防止のための制限機能
- **HTTPS対応**: 本番環境での安全な通信

## 🚀 クイックスタート

### 前提条件
- Node.js 16.0.0 以上
- npm または yarn
- Google Gemini API キー

### 1. セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/kator-pixel/positive-text-app.git
cd positive-text-app

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.example .env
# .envファイルを編集してAPIキーを設定
```

### 2. 環境変数の設定

`.env`ファイルを編集して、あなたのGemini APIキーを設定してください：

```env
GEMINI_API_KEY=your_actual_api_key_here
PORT=3000
NODE_ENV=development
```

### 3. APIキーの取得

1. [Google AI Studio](https://aistudio.google.com/app/apikey) にアクセス
2. 新しいAPIキーを作成
3. `.env`ファイルに設定

### 4. アプリケーションの実行

```bash
# 開発モードで起動
npm run dev

# または本番モードで起動
npm start
```

ブラウザで `http://localhost:3000` にアクセスしてください。

## 📁 プロジェクト構造

```
githubPages/
├── server.js              # メインサーバーファイル
├── package.json           # プロジェクト設定
├── .env.example          # 環境変数のテンプレート
├── .env                  # 実際の環境変数（Git除外）
├── .gitignore            # Git除外設定
├── SECURITY.md           # セキュリティガイド
├── README.md             # このファイル
└── public/               # フロントエンドファイル
    ├── index.html        # メインHTML
    ├── style.css         # スタイルシート
    └── script.js         # クライアントサイドJS
```

## 🛡️ セキュリティ機能

### APIキー保護
- APIキーはサーバーサイドの環境変数でのみ管理
- クライアントからは一切アクセス不可
- `.gitignore`で`.env`ファイルを除外

### レート制限
- 1分間に10リクエストまで（クライアント・サーバー両方）
- IPアドレスベースの制限
- 制限超過時の適切なエラー処理

### 入力検証
- 5000文字までの制限
- 不正な入力のサニタイゼーション
- 型チェック

### HTTPセキュリティ
- CORS設定
- セキュリティヘッダー（XSS、Frame Options等）
- Content-Type検証

## 🌐 デプロイメント

詳細なデプロイ手順は [DEPLOYMENT.md](./DEPLOYMENT.md) を参照してください。

### 推奨プラットフォーム

1. **Railway** (推奨) - シンプルで環境変数管理が簡単
2. **Heroku** - 老舗で豊富なアドオン
3. **Vercel** - 高速でCDN最適化
4. **DigitalOcean** - 手頃な価格で高性能

### クイックデプロイ (Railway)

```bash
# 1. Railway CLI インストール
npm install -g @railway/cli

# 2. ログイン
railway login

# 3. プロジェクト作成
railway init

# 4. 環境変数設定（Webダッシュボードから）
# GEMINI_API_KEY = your_actual_api_key

# 5. デプロイ
git push origin main
```

## 🔧 開発

### 開発サーバーの起動
```bash
npm run dev
```

### 本番ビルド
```bash
npm run build
npm start
```

## 📋 環境変数

| 変数名 | 説明 | 必須 | デフォルト |
|--------|------|------|-----------|
| `GEMINI_API_KEY` | Google Gemini API キー | ✅ | - |
| `PORT` | サーバーのポート番号 | ❌ | 3000 |
| `NODE_ENV` | 実行環境 | ❌ | development |

## 🎯 機能

- **テキスト変換**: ネガティブな文章をポジティブに変換
- **リアルタイム文字数カウント**: 5000文字制限の表示
- **コピー機能**: 結果をワンクリックでコピー
- **レスポンシブデザイン**: モバイル・デスクトップ対応
- **エラーハンドリング**: 分かりやすいエラーメッセージ
- **ローディング状態**: 変換中の視覚的フィードバック

## ⚠️ 重要な注意事項

1. **APIキーの管理**
   - `.env`ファイルは絶対にGitにコミットしないでください
   - APIキーが漏洩した場合は即座に無効化してください

2. **本番環境**
   - 必ずHTTPSを使用してください
   - 適切なドメインでCORSを設定してください

3. **セキュリティ**
   - 定期的にAPIキーを更新してください
   - アクセスログを監視してください

## 🐛 トラブルシューティング

### よくある問題

**Q: "APIキーが設定されていません"エラー**
A: `.env`ファイルに正しいAPIキーが設定されているか確認してください。

**Q: "リクエストが多すぎます"エラー**
A: 1分間に10回以上のリクエストを送信しています。少し待ってから再試行してください。

**Q: サーバーが起動しない**
A: Node.js 16.0.0以上がインストールされているか確認してください。

### ログの確認
```bash
# サーバーログを確認
npm start

# 詳細なデバッグログ
DEBUG=* npm start
```

## 🔗 関連リンク

- **リポジトリ**: https://github.com/kator-pixel/positive-text-app
- **Issues**: https://github.com/kator-pixel/positive-text-app/issues
- **Releases**: https://github.com/kator-pixel/positive-text-app/releases

## 📞 サポート

- **セキュリティ問題**: [SECURITY.md](./SECURITY.md) を参照
- **デプロイ問題**: [DEPLOYMENT.md](./DEPLOYMENT.md) を参照  
- **バグ報告**: [GitHub Issues](https://github.com/kator-pixel/positive-text-app/issues) を使用
- **機能要望**: [GitHub Discussions](https://github.com/kator-pixel/positive-text-app/discussions) を使用

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](./LICENSE) ファイルを参照してください。

## 🤝 コントリビューション

プルリクエストを歓迎します！コントリビュートする前に、以下を確認してください：

1. **セキュリティチェック**
   - APIキーが含まれていない
   - `.env`ファイルがコミットされていない
   - セキュリティガイドラインに従っている

2. **コード品質**
   - 適切なテストが追加されている
   - コードが既存スタイルに準拠している
   - ドキュメントが更新されている

3. **プルリクエスト**
   - 変更内容の明確な説明
   - 関連するIssueへの参照
   - セキュリティ影響の評価

### 開発フロー

```bash
# 1. フォーク
git fork https://github.com/kator-pixel/positive-text-app

# 2. ブランチ作成
git checkout -b feature/your-feature-name

# 3. 変更・テスト
npm test

# 4. コミット
git commit -m "feat: add your feature"

# 5. プッシュ
git push origin feature/your-feature-name

# 6. プルリクエスト作成
```

---

**⚡ 安全で高速なAIテキスト変換をお楽しみください！**