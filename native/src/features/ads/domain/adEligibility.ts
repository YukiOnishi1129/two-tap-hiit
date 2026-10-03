import type { AdThrottleState } from '../types/adThrottleState';
import type { AppConfig } from '@/shared/config/appConfig';
import { toDateKey } from '@/shared/lib/date';

// インタースティシャル広告を出してよいかを判定する純粋関数。
// ワークアウト中（運動・休憩・一時停止・開始前カウントダウン）は、そもそも呼び出さない設計にしている。

export type InterstitialPlacement = 'completion' | 'recordsTransition';

export const AD_RULES = {
  /** 完了後広告: 直前の広告からこの時間は空ける（連続で完了したとき用） */
  completionCooldownMs: 60 * 1000,
  /** ホーム⇔記録の遷移広告: 直前の広告からこの時間は空ける */
  recordsTransitionCooldownMs: 3 * 60 * 1000,
  /** 1日あたりの上限（全種類の合計） */
  maxInterstitialsPerDay: 6,
} as const;

type Context = {
  now: Date;
  config: AppConfig;
  /** 0 以上 1 未満の乱数。テストで固定できるように外から渡す。 */
  random: number;
};

function countToday(state: AdThrottleState, today: string): number {
  return state.interstitialCountDate === today ? state.interstitialCountToday : 0;
}

function msSinceLastShown(state: AdThrottleState, now: Date): number {
  if (!state.lastInterstitialShownAt) return Number.POSITIVE_INFINITY;
  return now.getTime() - new Date(state.lastInterstitialShownAt).getTime();
}

export function canShowInterstitial(
  placement: InterstitialPlacement,
  state: AdThrottleState,
  { now, config, random }: Context,
): boolean {
  const today = toDateKey(now);
  if (countToday(state, today) >= AD_RULES.maxInterstitialsPerDay) return false;

  if (placement === 'completion') {
    return msSinceLastShown(state, now) >= AD_RULES.completionCooldownMs;
  }

  // recordsTransition: 1日1回まで + クールダウン + 確率
  if (state.recordsTransitionShownDate === today) return false;
  if (msSinceLastShown(state, now) < AD_RULES.recordsTransitionCooldownMs) return false;
  return random < config.ads.recordsTransitionProbability;
}

export function markInterstitialShown(
  placement: InterstitialPlacement,
  state: AdThrottleState,
  now: Date,
): AdThrottleState {
  const today = toDateKey(now);
  return {
    ...state,
    lastInterstitialShownAt: now.toISOString(),
    interstitialCountToday: countToday(state, today) + 1,
    interstitialCountDate: today,
    recordsTransitionShownDate:
      placement === 'recordsTransition' ? today : state.recordsTransitionShownDate,
  };
}
