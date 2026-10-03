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
npm run ios        # 開発ビルドを作ってシミュレーターで起動（Android は npm run android）
npm run ios:ja     # 端末の言語に関係なく日本語で起動
```

- `expo-audio` などネイティブモジュールを使っているため、Expo Go ではなく開発ビルドで動かします
- 一度ビルドしたあとは、JS の変更だけなら `npm start`（日本語は `npm run start:ja`）で十分です。ネイティブのパッケージを追加したときはもう一度 `npm run ios`
- アプリは端末の言語で日本語／英語を切り替えます。シミュレーターは初期状態が英語なので、日本語で見たいときは `:ja` 付きのスクリプトを使います（切り替わらないときは `npx expo start --clear` でキャッシュを消す）

よく使うコマンド:

| コマンド | 内容 |
| --- | --- |
| `npm run typecheck` | 型チェック（TypeScript 7） |
| `npm run lint` | oxlint（層ごとの依存ルールもチェック） |
| `npm test` | テスト（Jest） |
| `npm run generate:sounds` | 効果音と BGM（WAV）を作り直す |

環境変数（任意）:

| 変数 | 内容 |
| --- | --- |
| `EXPO_PUBLIC_ADS_MODE` | `mock`（ダミー広告を表示）または `off`。未指定なら開発中は `mock`、本番は `off` |
| `EXPO_PUBLIC_LOCALE` | `ja` / `en` で言語を強制（開発用）。未指定なら端末の言語 |
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

## CI（GitHub Actions）

`main` への push と Pull Request で、変更があった側だけ実行します。

| ワークフロー | 実行内容 |
| --- | --- |
| [native](.github/workflows/native.yml) | oxlint → 型チェック → Jest → expo-doctor → iOS / Android の JS バンドル作成 |
| [server](.github/workflows/server.yml) | oxlint → 型チェック → Vitest → `wrangler deploy --dry-run`（デプロイはしない） |

ネイティブのバイナリ（ipa / apk）は CI では作りません。実機向けのビルドは EAS Build で行います。

