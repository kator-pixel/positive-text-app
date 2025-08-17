# 🚀 デプロイメントガイド

この文書では、Positive Text Transformerアプリを各種プラットフォームに安全にデプロイする方法を説明します。

## 🔒 セキュリティ確認事項

デプロイ前に以下を必ず確認してください：

- [ ] `.env`ファイルが`.gitignore`に含まれている
- [ ] リポジトリにAPIキーが含まれていない
- [ ] `.env.example`ファイルが適切に設定されている
- [ ] README.mdにセキュリティ情報が記載されている

## 🌐 推奨デプロイメントプラットフォーム

### 1. Railway (推奨)

**特徴**: シンプル、環境変数管理が簡単、Node.js最適化

```bash
# 1. Railwayアカウント作成
# https://railway.app

# 2. プロジェクト作成
railway login
railway init

# 3. 環境変数設定（Webダッシュボードから）
# GEMINI_API_KEY = your_actual_api_key
# NODE_ENV = production

# 4. デプロイ
git push origin main
```

### 2. Heroku

**特徴**: 老舗、豊富なアドオン、無料枠あり

```bash
# 1. Herokuアプリ作成
heroku create your-positive-app-name

# 2. 環境変数設定
heroku config:set GEMINI_API_KEY=your_actual_api_key
heroku config:set NODE_ENV=production

# 3. デプロイ
git push heroku main
```

### 3. Vercel

**特徴**: 高速、CDN最適化、静的サイト対応

```bash
# 1. Vercelプロジェクト作成
npm i -g vercel
vercel

# 2. 環境変数設定（ダッシュボードから）
# GEMINI_API_KEY = your_actual_api_key
# NODE_ENV = production

# 3. デプロイ
vercel --prod
```

### 4. DigitalOcean App Platform

**特徴**: 手頃な価格、高性能、スケーラブル

```bash
# 1. App Platform でプロジェクト作成
# 2. GitHub連携設定
# 3. 環境変数設定:
#    GEMINI_API_KEY = your_actual_api_key
#    NODE_ENV = production
# 4. 自動デプロイ設定
```

## ⚙️ 環境変数設定

各プラットフォームで以下の環境変数を設定してください：

| 変数名 | 値 | 必須 |
|--------|-----|------|
| `GEMINI_API_KEY` | あなたのGemini APIキー | ✅ |
| `NODE_ENV` | `production` | ✅ |
| `PORT` | (自動設定される場合が多い) | ❌ |

## 🔧 カスタムドメイン設定

### Railway
```bash
# カスタムドメインを追加
railway domain add your-domain.com
```

### Heroku
```bash
# カスタムドメインを追加
heroku domains:add your-domain.com
```

### Vercel
```bash
# カスタムドメインを追加
vercel domains add your-domain.com
```

## 🛡️ SSL/HTTPS設定

すべての推奨プラットフォームで自動的にHTTPS証明書が提供されます。

- **Railway**: 自動SSL
- **Heroku**: 自動SSL  
- **Vercel**: 自動SSL
- **DigitalOcean**: Let's Encrypt自動設定

## 📊 監視とログ

### Railway
```bash
# ログを表示
railway logs
```

### Heroku
```bash
# ログを表示
heroku logs --tail
```

### Vercel
```bash
# ログを表示（ダッシュボードから）
vercel logs
```

## 🚨 トラブルシューティング

### よくある問題と解決法

**Q: "GEMINI_API_KEY is not defined"エラー**
```bash
# 環境変数が正しく設定されているか確認
# プラットフォームのダッシュボードで確認
```

**Q: CORS エラー**
```javascript
// server.js で適切なOriginを設定
app.use(cors({
  origin: ['https://your-domain.com']
}));
```

**Q: メモリ不足エラー**
```bash
# プランをアップグレードするか、
# package.json で軽量化
```

## 🔄 CI/CD 設定

GitHub Actionsが自動的に：

1. ✅ セキュリティチェック
2. ✅ APIキー漏洩検査  
3. ✅ 依存関係監査
4. ✅ ビルドテスト

## 💰 コスト比較

| プラットフォーム | 無料枠 | 有料プラン開始 |
|------------------|---------|----------------|
| Railway | $5/月まで無料 | $5/月〜 |
| Heroku | 550-1000時間/月 | $7/月〜 |
| Vercel | 100GB/月 | $20/月〜 |
| DigitalOcean | なし | $5/月〜 |

## 📈 パフォーマンス最適化

### Railway
- 自動スケーリング設定
- リージョン選択

### Heroku
- Dyno スリープ防止
- Redis アドオン追加

### Vercel
- Edge Functions活用
- 画像最適化

## 🔐 セキュリティ チェックリスト

デプロイ後の確認事項：

- [ ] HTTPS で正常にアクセスできる
- [ ] API キーが環境変数で設定されている
- [ ] レート制限が正常に動作している
- [ ] エラーページでスタックトレースが表示されない
- [ ] セキュリティヘッダーが設定されている
- [ ] 不要なデバッグ情報が削除されている

## 📞 サポート

デプロイで問題が発生した場合：

1. まず[トラブルシューティング](#-トラブルシューティング)を確認
2. プラットフォームのログを確認
3. [Issues](https://github.com/kator-pixel/positive-text-app/issues)で報告

---

**🎉 安全で高性能なデプロイをお楽しみください！**