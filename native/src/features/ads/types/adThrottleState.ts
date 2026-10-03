import { z } from 'zod';

export const AdThrottleStateSchema = z.object({
  /** 最後にインタースティシャル広告を表示した時刻 (ISO 8601) */
  lastInterstitialShownAt: z.string().optional(),
  /** interstitialCountDate の日に表示した回数 */
  interstitialCountToday: z.number().int().nonnegative(),
  /** interstitialCountToday を数えている日 (YYYY-MM-DD) */
  interstitialCountDate: z.string().optional(),
  /** ホーム⇔記録の遷移広告を最後に表示した日 (YYYY-MM-DD)。1日1回までに制限する。 */
  recordsTransitionShownDate: z.string().optional(),
});
export type AdThrottleState = z.infer<typeof AdThrottleStateSchema>;

export const INITIAL_AD_THROTTLE_STATE: AdThrottleState = { interstitialCountToday: 0 };
