import { z } from 'zod';

// サーバーの GET /config のレスポンス。端末側はデフォルト値で動き、取得できたら上書きする。
export const AppConfigSchema = z.object({
  ads: z.object({
    recordsTransitionProbability: z.number().min(0).max(1),
    completionInterstitialDelaySeconds: z.number().min(0).max(60),
  }),
});
export type AppConfig = z.infer<typeof AppConfigSchema>;

export const DEFAULT_APP_CONFIG: AppConfig = {
  ads: {
    recordsTransitionProbability: 0.25,
    completionInterstitialDelaySeconds: 5,
  },
};

/** 不正・欠損したレスポンスでも必ず使える AppConfig を返す。 */
export function ensureAppConfig(response: unknown): AppConfig {
  const parsed = AppConfigSchema.safeParse(response);
  return parsed.success ? parsed.data : DEFAULT_APP_CONFIG;
}
