# native の設計方針

`native/`（Expo / React Native アプリ）のディレクトリ構成と、コードの置き場所のルールです。

ベースにしたのは [Next.js App Router の設計記事](https://zenn.dev/yukionishi/articles/cd79e39ea6c172) の「`app/` は薄く・`features/` に機能をまとめる・Container / Presenter に分ける・置き場所のルールを Lint で強制する」という考え方です。
このアプリにはサーバー処理がないので、記事の `external/`（handler → service → repository のサーバー側アダプタ層）は使っていません。

---

## ディレクトリ構成

```txt
native/src/
├─ app/                 # Expo Router のルート（薄く保つ）
│  ├─ (tabs)/           # 下のタブ: ホーム / 記録 / 設定
│  └─ course, sets, workout, complete  # タブの上に重ねて出す画面（ワークアウト中はタブバーなし）
├─ features/            # 機能ごとのまとまり
│  ├─ home/             # ホーム画面
│  ├─ workout/          # コース選択・セット数選択・タイマー・完了画面
│  ├─ records/          # 記録の保存・集計・記録画面・今週のドット
│  ├─ ads/              # 広告の出し分けルール・ダミー広告・バナー枠
│  └─ settings/         # 設定画面（BGM・サウンド・バイブ）。将来「広告を消す」もここ
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
- `expo-audio` / `expo-haptics` は `features/workout/lib/`（soundClient / bgmClient / hapticsClient）だけ
- `react-native-google-mobile-ads` / `expo-tracking-transparency` は `features/ads/` の中だけ

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
| セット数の選択肢 | フリー・1・2・4・6・8（2列で「フリー・1 / 2・4 / 6・8」） | 「1セットだけ」「決めずにやりたい」の要望に対応 |
| フリー | セット数を決めずに始め、「おわる」を押すまで続く（上限99セット）。終えたセット数で記録し、「途中まで」の表示は付けない。終了ボタンは「おわる」、確認は「ここで終わる？ 3セットを記録します。」 | 好きなところで終わるのがフリーの正しい使い方なので |
| もう1セット | 完了画面に「もう1セットやる」ボタン。同じコースで1セット追加（開始前3秒カウントダウンあり）。記録は**同じ回に足し算**する（4セット → 5セット）。何回でもできる | やる気が残っている終わった直後に、ワンタップで続けられるように。ホームにポップアップを出すとスタートの邪魔になるため完了画面に置く |
| 最後のセットの後ろの休憩 | 入れない（最後の種目が終わったら完了） | 休憩で終わるのは意味がないため。合計時間 = 30秒 × 種目数 + 15秒 ×（種目数 − 1） |
| 開始前 | 3秒のカウントダウンを入れる | ブリーフの「または3秒カウントダウン」を採用。この間も広告なし |
| 完了画面の広告 | 5秒後に、出せる条件なら全画面広告。**閉じたあとも完了画面に残る**（自動でホームへは行かない）。「ホームへ」を押したとき、まだ出していなければその場で判定してからホームへ | ブリーフでは「閉じたらホームへ」だったが、「もう1セット」を選べるように変更した |
| 1回の完了画面で広告1回 | 自動（5秒）とホームボタンが同じ Promise を共有する。「もう1セット」を押したときは出さない（判定中に押された場合も、表示の直前に取りやめる） | 広告の読み込み中に押されても二重に出ない。スタート導線に広告を挟まない |
| ホーム ⇔ 記録の広告 | タブを押したときに判定。確率25%・1日1回・直前の広告から3分あける・1日の合計上限6回。出す場合は広告を閉じてからタブを切り替える。設定タブへの切り替えでは出さない | 1日1回スタートするだけの使い方だと完了後広告しか出ないため、控えめに残す。設定（将来の広告削除課金）に来た人には出さない |
| 完了後広告の連続表示 | 直前の広告から1分あける | 2セットを続けて完了した場合など |
| 画面構成 | 下のタブで「ホーム / 記録 / 設定」。コース選択〜完了はタブの上に重ねて表示し、完了後はホームタブに戻る | 記録や設定にいつでもワンタップで行けるように。ホームは「スタートボタン」だけに集中できる |
| 途中でやめた回 | 1種目（30秒）以上やっていれば記録する。できたセット数と実際に動いた時間を保存し、完了画面（「途中までの分も記録したよ」）へ進む。カレンダーでは運動した日として数える | 頑張った分を無駄にしない・罪悪感を持たせないため。終了確認のダイアログで、記録されるかどうかを先に伝える |
| 記録の詳細 | 記録画面でカレンダーの日付をタップすると、その日の「時刻・コース・セット数・時間」が出る（初期表示は今日） | 何をどれだけやったか振り返れるように。途中でやめた回は「2/4セット（途中まで）」 |
| 週・月・連続の数え方 | 回数ではなく「運動した日数」 | 1日に2回やっても1日 |
| 連続日数 | 今日まだやっていなくても、昨日まで続いていれば途切れていない扱い | 朝に「連続0日」と出て罪悪感を持たせないため |
| 週の始まり | 月曜日 | |
| バナーの位置 | ホーム・記録・コース選択・セット数選択・完了画面の下。ワークアウト画面と設定画面には置かない | 1日1回スタートするだけでも表示回数を確保するため。選択画面のバナーは画面内に出るだけで、画面の切り替えを邪魔しない |
| BGM・サウンド・バイブの切り替え | 設定タブに置く | ブリーフの「振動はオフにできるように」に対応。ホームやスタート導線には置かない |
| 広告の有効／無効 | `EXPO_PUBLIC_ADS_MODE=admob|test|off`。未指定なら開発中は `test`（Google のテスト広告）、本番ビルドは `admob`。本番の広告ユニット ID が未設定なら広告は出さない | テスト中に本番広告をタップしてしまう（AdMob の規約違反）のを防ぐため |
| 広告の同意 | 起動時に「EU 等の同意フォーム（UMP）→ iOS のトラッキング許可（ATT）→ SDK 初期化」の順で1回だけ。許可しなくても広告は出る（パーソナライズされないだけ） | Google の EU ユーザー同意ポリシーと Apple の ATT に対応。日本では同意フォームは出ない |
| バナーのサイズ | 固定 320×50 を中央に置く | 画面の左右の余白の中に必ず収まるように（アダプティブバナーは画面幅いっぱいになるため） |
| ワークアウト中の画面 | スリープしない（keep awake）。スワイプで戻れない。Android の戻るボタンは終了確認 | |
| タイマーの精度 | 時刻の差分で経過時間を計算する | setInterval の誤差やバックグラウンドでずれないように |
| ダークモード | MVP ではライトのみ | |
| 運動の見せ方 | 棒人間アニメーション（SVG + Reanimated）+ 種目名の下に一行のやり方 | 「どんな運動をすればいいかわからない」を解消するため。休憩中・開始前は腰に手を当てて呼吸する棒人間を動かし、つぎの種目は「止めた絵（その種目らしい姿勢）+ 名前 + やり方」のカードで予告する。予習の動きを流すと、休憩中にその運動をするように見えてしまうため |
| カウントダウンの音 | 運動・休憩・開始前のすべてで、終わる3秒前から1秒ごとに「ピッ」。運動開始は「ピーッ」、休憩開始は「ピッ・ポー」 | 画面を見なくても切り替わりがわかるように |
| BGM | 運動中は音量 0.5、休憩中は 0.2、開始前・一時停止中・完了後は停止。設定タブでオフにできる | 曲は `scripts/generate-sounds.mjs` で自前生成（権利の心配なし）。他アプリの音楽は止めずに少し下げる |

---

## 今後の差し替えポイント

| やりたいこと | 触る場所 |
| --- | --- |
| AdMob の本番 ID を設定する | 広告ユニット ID は `features/ads/lib/adUnits.ts`、アプリ ID は `app.json` の `react-native-google-mobile-ads` プラグイン設定（いまは Google のサンプル ID）。変更後はネイティブの再ビルドが必要 |
| 広告なし課金を入れる | `features/ads/lib/purchaseClient.ts` |
| 運動アニメーションを本物にする／動きを調整する | `features/workout/components/ExerciseVisual/`（姿勢は `poses.ts`。手足の長さが変わらないかはテストで確認） |
| BGM を市販の曲などに差し替える | `native/assets/sounds/bgm.wav` を置き換える（ループ再生される） |
| サーバーの設定を読む | `EXPO_PUBLIC_API_BASE_URL` を設定するだけ（`shared/config/`） |
| 効果音・BGM を作り直す | `native/scripts/generate-sounds.mjs` を編集して `npm run generate:sounds` |
| UI コンポーネントを追加する | `npx @react-native-reusables/cli@latest add <name>` か、レジストリからコピーして `shared/components/ui/` へ |
