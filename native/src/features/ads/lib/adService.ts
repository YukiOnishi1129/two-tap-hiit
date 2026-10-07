import { hasNoAdsEntitlement } from './purchaseClient';
import { isInterstitialAvailable, showInterstitial } from './admobClient';
import { getAdThrottleState, saveAdThrottleState } from '../repository/adThrottleRepository';
import { getAppConfig } from '@/shared/config/getAppConfig';

import { canShowInterstitial, type InterstitialPlacement, markInterstitialShown } from '../domain/adEligibility';

export type InterstitialResult = 'shown' | 'skipped';

/**
 * 条件を満たしていればインタースティシャル広告を表示し、閉じられるまで待つ。
 * 広告まわりで何が起きても例外は投げない（広告のせいで画面遷移が止まらないようにする）。
 */
export async function tryShowInterstitial(
  placement: InterstitialPlacement,
  options: {
    /**
     * 表示する直前に呼ぶ。false を返したら出さない。
     * 判定を待っているあいだにユーザーが別の操作（「もう1セット」など）をした場合に、広告が割り込まないようにする
     */
    isStillWanted?: () => boolean;
  } = {},
): Promise<InterstitialResult> {
  try {
    if (!isInterstitialAvailable() || (await hasNoAdsEntitlement())) return 'skipped';

    const [state, config] = await Promise.all([getAdThrottleState(), getAppConfig()]);
    const now = new Date();
    if (!canShowInterstitial(placement, state, { now, config, random: Math.random() })) return 'skipped';
    if (options.isStillWanted && !options.isStillWanted()) return 'skipped';

    // 表示前に記録しておき、広告が閉じられる前に再度呼ばれても二重に出ないようにする
    await saveAdThrottleState(markInterstitialShown(placement, state, now));
    await showInterstitial();
    return 'shown';
  } catch {
    return 'skipped';
  }
}
