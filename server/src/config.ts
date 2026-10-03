// GET /config で返すアプリ設定。
// native 側 (native/src/shared/config/appConfig.ts) の AppConfig と同じ形にすること。
// native はこの値が取れなくてもデフォルト値で動く。

export type AppConfig = {
  ads: {
    /** ホーム⇔記録の遷移で広告を出す確率 (0〜1) */
    recordsTransitionProbability: number;
    /** 完了画面を表示してから広告を出すまでの秒数 */
    completionInterstitialDelaySeconds: number;
  };
};

export const APP_CONFIG: AppConfig = {
  ads: {
    recordsTransitionProbability: 0.25,
    completionInterstitialDelaySeconds: 5,
  },
};
