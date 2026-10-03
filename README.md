# two-tap-hiit

**2-Tap HIIT**（迷わない30秒運動）のモノレポです。
ログインなし・メニュー作りなしで、コースとセット数を選ぶだけで始められる HIIT タイマーアプリです。

| ディレクトリ | 中身 |
| --- | --- |
| [native/](native/) | Expo / React Native のモバイルアプリ |
| [server/](server/) | Cloudflare Workers + Hono の API（いまは `/health` と `/config` だけ） |
| [docs/](docs/) | 仕様・設計ドキュメント |

## ドキュメント

- [docs/implementation-brief.md](docs/implementation-brief.md) — MVP の仕様（何を作るか）
- [docs/architecture.md](docs/architecture.md) — native の設計方針（どこに何を置くか）と実装の判断

## 必要なもの

- Node.js 24 以上
- npm
- 実機で試す場合: iOS シミュレーター（Xcode）または Android エミュレーター

## native（アプリ）

```sh
cd native
npm install
npm start          # 開発サーバーを起動（i で iOS、a で Android）
```

`expo-audio` などネイティブモジュールを使っているため、Expo Go ではなく開発ビルドで動かします。

```sh
npx expo run:ios       # または npx expo run:android
```

よく使うコマンド:

| コマンド | 内容 |
| --- | --- |
| `npm run typecheck` | 型チェック（TypeScript 7） |
| `npm run lint` | oxlint（層ごとの依存ルールもチェック） |
| `npm test` | テスト（Jest） |
| `npm run generate:sounds` | 効果音（WAV）を作り直す |

環境変数（任意）:

| 変数 | 内容 |
| --- | --- |
| `EXPO_PUBLIC_ADS_MODE` | `mock`（ダミー広告を表示）または `off`。未指定なら開発中は `mock`、本番は `off` |
| `EXPO_PUBLIC_API_BASE_URL` | server の URL。設定すると `/config` を読む。未設定ならローカルのデフォルト値で動く |

## server（API）

```sh
cd server
npm install
npm run dev        # http://localhost:8787/health
```

| コマンド | 内容 |
| --- | --- |
| `npm run typecheck` | 型チェック |
| `npm run lint` | oxlint |
| `npm test` | テスト（Vitest） |
| `npm run deploy` | Cloudflare にデプロイ |
