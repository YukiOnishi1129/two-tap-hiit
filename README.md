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
- [docs/operations.md](docs/operations.md) — 運用ガイド（収益化の方針・売上の試算・アカウント・リリース手順・メンテナンス）

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
- 一度ビルドしたあとは、JS の変更だけなら `npm start`（日本語は `npm run start:ja`）で十分です
- **ネイティブのパッケージを追加したときや `app.json` のプラグイン設定を変えたときは `npm run ios:clean`**（Android は `npm run android:clean`）。`ios/` `android/` を作り直してからビルドします。`npm run ios` だけだと古い設定のままビルドされ、起動時に落ちることがあります（例: AdMob のアプリ ID が無いと即クラッシュ）
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
| `EXPO_PUBLIC_ADS_MODE` | `test`（Google のテスト広告）/ `admob`（本番の広告）/ `off`（広告なし）。未指定なら開発中は `test`、本番ビルドは `admob` |
| `EXPO_PUBLIC_LOCALE` | `ja` / `en` で言語を強制（開発用）。未指定なら端末の言語 |
| `EXPO_PUBLIC_API_BASE_URL` | server の URL。設定すると `/config` を読む。未設定ならローカルのデフォルト値で動く |

## TestFlight に配信する（iOS）

EAS（Expo のクラウドビルド）でビルドし、そのまま TestFlight に上げます。

必要なもの:

- 有料の Apple Developer Program（年額）
- Expo アカウント（無料）
- テストする iPhone に TestFlight アプリ

```sh
cd native
npm run testflight   # = npx testflight@latest
```

対話形式で次の順に進みます。

1. Expo にログインし、EAS プロジェクトを作る（初回のみ。`app.json` に projectId が追加されるのでコミットする）
2. Bundle ID の確認（`com.yukionishi.twotaphiit`）と、暗号化の質問（標準の暗号化しか使っていないので「使っていない」）
3. Apple ID でログイン（2段階認証あり）。証明書とプロビジョニングプロファイルは EAS が自動で作る
4. EAS 上で本番ビルド（ビルド番号は自動で +1）
5. App Store Connect にアップロードして、TestFlight の内部テストに配信

アップロード後、Apple 側の処理に5〜10分ほどかかります。終わったら App Store Connect の TestFlight 画面で内部テスターを追加すると、TestFlight アプリからインストールできます。

- 2回目以降も `npm run testflight` だけで、新しいビルドが TestFlight に上がります
- 本番ビルドは `EXPO_PUBLIC_ADS_MODE=admob` です。AdMob の広告ユニット ID を設定するまでは広告は出ません（[native/src/features/ads/lib/adUnits.ts](native/src/features/ads/lib/adUnits.ts)）
- 外部テスター（チーム外の人）に配る場合は、Apple の Beta App Review が必要です

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
| [testflight](.github/workflows/testflight.yml) | main で native の CI が成功したら、EAS で iOS をビルドして TestFlight に自動アップロード。コミットメッセージに `[skip testflight]` でスキップ。Actions 画面から手動実行も可（本番設定 / テスト広告入り） |

native / server のワークフローでは、ネイティブのバイナリ（ipa / apk）は作りません。iOS のバイナリは testflight ワークフローが EAS Build に依頼して作ります。

testflight ワークフローを動かすには、GitHub のリポジトリに `EXPO_TOKEN` シークレットが必要です（expo.dev → Account settings → Access tokens で作成 → GitHub の Settings → Secrets and variables → Actions に登録）。

