# native の設計方針

`native/`（Expo / React Native アプリ）のディレクトリ構成と、コードの置き場所のルールです。

ベースにしたのは [Next.js App Router の設計記事](https://zenn.dev/yukionishi/articles/cd79e39ea6c172) の「`app/` は薄く・`features/` に機能をまとめる・Container / Presenter に分ける・置き場所のルールを Lint で強制する」という考え方です。
このアプリにはサーバー処理がないので、記事の `external/`（handler → service → repository のサーバー側アダプタ層）は使っていません。

---

## ディレクトリ構成

```txt
native/src/
├─ app/                 # Expo Router のルート（薄く保つ）
├─ features/            # 機能ごとのまとまり
│  ├─ home/             # ホーム画面
│  ├─ workout/          # コース選択・セット数選択・タイマー・完了画面
│  ├─ records/          # 記録の保存・集計・記録画面・今週のドット
│  ├─ ads/              # 広告の出し分けルール・ダミー広告・バナー枠
│  └─ settings/         # サウンド／バイブの設定
└─ shared/              # 全体で使う共通部品
   ├─ components/       # Screen など
   │  └─ ui/            # React Native Reusables（shadcn/ui の RN 版）のコンポーネント
   ├─ config/           # アプリ設定（サーバーの GET /config とデフォルト値）
   ├─ domain/           # コース・セット数など、全体で共有する定義
   ├─ i18n/             # 日本語・英語の文言
   └─ lib/              # 日付・保存・クラス名結合などのユーティリティ
```

### feature の中身

```txt
features/{feature}/
├─ components/
│  └─ {Component}/
│     ├─ {Component}Container.tsx   # hook を呼んで Presenter に渡すだけ
│     ├─ {Component}Presenter.tsx   # 描画だけ（props → 見た目）
│     ├─ use{Component}.ts          # 状態・画面遷移・データの読み書き
│     ├─ use{Component}.test.ts     # 必要に応じてテスト
│     └─ index.ts
├─ domain/        # 純粋関数（タイマーの計算、広告を出してよいかの判定、記録の集計など）
├─ repository/    # 端末への保存・読み込み（AsyncStorage）
├─ lib/           # 音・振動・広告 SDK などの外部 API のラッパー
├─ types/         # zod スキーマと型
└─ index.ts       # この feature の公開 API
```

全部のフォルダが必須なわけではなく、必要なものだけ作ります。

---

## 各層の役割

| 層 | 役割 | やってはいけないこと |
| --- | --- | --- |
| `app/` | ルーティング、URL パラメータの受け取りと検証、レイアウト | データ取得・ロジック |
| `use{Component}.ts` | 状態管理、画面遷移、repository / lib の呼び出し | 描画 |
| `{Component}Presenter.tsx` | 描画のみ | `expo-router`、repository、lib の import |
| `domain/` | 純粋関数（テストしやすい） | 副作用（保存・通信・時刻の取得はなるべく引数で受け取る） |
| `repository/` | 端末保存の読み書き。壊れたデータは zod で弾いてデフォルト値にする | UI |
| `lib/` | 外部 API（音・振動・広告 SDK・課金）の差し替えポイント | UI |
| `shared/` | どの feature からも使える部品 | `features/` への依存 |

---

## 依存のルール（oxlint で強制）

`native/.oxlintrc.json` の `no-restricted-imports` でチェックしています。違反すると `npm run lint` がエラーになります。

- 他の feature を使うときは **公開 API（`@/features/<name>`）経由だけ**。`@/features/records/repository/...` のような深い import は禁止
- 同じ feature の中は相対パスで import する
- `shared/` は `features/` に依存しない
- Presenter は `expo-router`・repository・`lib/*Client` を import しない
- `@react-native-async-storage/async-storage` は `shared/lib/storage.ts` だけ
- `expo-audio` / `expo-haptics` は `features/workout/lib/` だけ

---

## ツール

| 用途 | ツール |
| --- | --- |
| 型チェック | TypeScript 7（`npm run typecheck`） |
| Lint | oxlint（`npm run lint`）。TS 7 は ESLint の typescript-eslint が未対応のため |
| テスト | Jest（jest-expo）+ React Native Testing Library（`npm test`） |
| スタイル | NativeWind v4（Tailwind CSS v3） |
| UI コンポーネント | React Native Reusables（shadcn/ui の RN 版）。`shared/components/ui/` にコピーして使う |
| バリデーション | zod（保存データ・サーバー設定） |

メモ:

- Expo SDK 57 の推奨は TypeScript 6 ですが、トランスパイルは Babel が行い tsc は型チェック専用なので TS 7 を使っています（`expo install --check` の警告は `package.json` の `expo.install.exclude` で抑えています）
- テストは記事では Vitest ですが、React Native のコンポーネントや hook のテストには Expo 公式の jest-expo が安定しているため Jest にしています
- データはすべて端末内なので、TanStack Query は使っていません

---

## 主な実装の判断（ブリーフで決まっていなかった点）

| 項目 | 判断 | 理由 |
| --- | --- | --- |
| 最後のセットの後ろの休憩 | 入れない（最後の種目が終わったら完了） | 休憩で終わるのは意味がないため。合計時間 = 30秒 × 種目数 + 15秒 ×（種目数 − 1） |
| 開始前 | 3秒のカウントダウンを入れる | ブリーフの「または3秒カウントダウン」を採用。この間も広告なし |
| 完了画面で5秒経ったが広告を出せない場合 | 完了画面にとどまる（ホームボタンで戻る） | 「おつかれ！」を見る前に勝手に画面が変わらないようにするため |
| 1回の完了で広告1回 | 自動（5秒）とホームボタンが同じ Promise を共有する | 広告の読み込み中に押されても二重に出ない |
| ホーム ⇔ 記録の広告 | 確率25%・1日1回・直前の広告から3分あける・1日の合計上限6回 | 行ったり来たり対策 |
| 完了後広告の連続表示 | 直前の広告から1分あける | 2セットを続けて完了した場合など |
| 記録画面の戻る操作 | 画面上部の「戻る」ボタンで広告判定。iOS のスワイプ／Android の戻るボタンでは判定しない | 広告が減る方向なので許容 |
| 週・月・連続の数え方 | 回数ではなく「運動した日数」 | 1日に2回やっても1日 |
| 連続日数 | 今日まだやっていなくても、昨日まで続いていれば途切れていない扱い | 朝に「連続0日」と出て罪悪感を持たせないため |
| 週の始まり | 月曜日 | |
| サウンド／バイブの切り替え | 記録画面の下に置く | ブリーフの「振動はオフにできるように」に対応。ホームやスタート導線には置かない |
| 広告の有効／無効 | `EXPO_PUBLIC_ADS_MODE=mock|off`。未指定なら開発中は `mock`（ダミー広告）、本番ビルドは `off` | AdMob 導入前に本番で出ないように |
| ワークアウト中の画面 | スリープしない（keep awake）。スワイプで戻れない。Android の戻るボタンは終了確認 | |
| タイマーの精度 | 時刻の差分で経過時間を計算する | setInterval の誤差やバックグラウンドでずれないように |
| ダークモード | MVP ではライトのみ | |

---

## 今後の差し替えポイント

| やりたいこと | 触る場所 |
| --- | --- |
| AdMob を導入する | `features/ads/lib/interstitialAdClient.ts`（インタースティシャル）、`features/ads/components/BannerAdSlot/`（バナー） |
| 広告なし課金を入れる | `features/ads/lib/purchaseClient.ts` |
| 運動アニメーションを本物にする | `features/workout/components/ExerciseVisual/` |
| サーバーの設定を読む | `EXPO_PUBLIC_API_BASE_URL` を設定するだけ（`shared/config/`） |
| 効果音を作り直す | `native/scripts/generate-sounds.mjs` を編集して `npm run generate:sounds` |
| UI コンポーネントを追加する | `npx @react-native-reusables/cli@latest add <name>` か、レジストリからコピーして `shared/components/ui/` へ |
