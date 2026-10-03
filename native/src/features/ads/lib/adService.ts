import { hasNoAdsEntitlement } from './purchaseClient';
import { isInterstitialAvailable, showInterstitial } from './interstitialAdClient';
import { getAdThrottleState, saveAdThrottleState } from '../repository/adThrottleRepository';
import { getAppConfig } from '@/shared/config/getAppConfig';

import { canShowInterstitial, type InterstitialPlacement, markInterstitialShown } from '../domain/adEligibility';

export type InterstitialResult = 'shown' | 'skipped';

/**
 * 条件を満たしていればインタースティシャル広告を表示し、閉じられるまで待つ。
 * 広告まわりで何が起きても例外は投げない（広告のせいで画面遷移が止まらないようにする）。
 */
export async function tryShowInterstitial(placement: InterstitialPlacement): Promise<InterstitialResult> {
  try {
    if (!isInterstitialAvailable() || (await hasNoAdsEntitlement())) return 'skipped';

    const [state, config] = await Promise.all([getAdThrottleState(), getAppConfig()]);
    const now = new Date();
    if (!canShowInterstitial(placement, state, { now, config, random: Math.random() })) return 'skipped';

    // 表示前に記録しておき、広告が閉じられる前に再度呼ばれても二重に出ないようにする
    await saveAdThrottleState(markInterstitialShown(placement, state, now));
    await showInterstitial();
    return 'shown';
  } catch {
    return 'skipped';
  }
}
