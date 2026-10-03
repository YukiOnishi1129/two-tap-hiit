import { INITIAL_AD_THROTTLE_STATE } from '../types/adThrottleState';
import { DEFAULT_APP_CONFIG } from '@/shared/config/appConfig';

import { AD_RULES, canShowInterstitial, markInterstitialShown } from './adEligibility';

const now = new Date(2026, 9, 4, 12, 0, 0);
const ctx = (overrides: Partial<{ now: Date; random: number }> = {}) => ({
  now,
  config: DEFAULT_APP_CONFIG,
  random: 0,
  ...overrides,
});

describe('完了後の広告', () => {
  it('初回は出せる', () => {
    expect(canShowInterstitial('completion', INITIAL_AD_THROTTLE_STATE, ctx())).toBe(true);
  });

  it('直前に広告を出していたら出さない', () => {
    const state = markInterstitialShown('completion', INITIAL_AD_THROTTLE_STATE, now);
    const later = new Date(now.getTime() + AD_RULES.completionCooldownMs - 1);
    expect(canShowInterstitial('completion', state, ctx({ now: later }))).toBe(false);
    const enough = new Date(now.getTime() + AD_RULES.completionCooldownMs);
    expect(canShowInterstitial('completion', state, ctx({ now: enough }))).toBe(true);
  });

  it('1日の上限に達したら出さない。日付が変わればリセット', () => {
    const state = {
      ...INITIAL_AD_THROTTLE_STATE,
      interstitialCountToday: AD_RULES.maxInterstitialsPerDay,
      interstitialCountDate: '2026-10-04',
    };
    expect(canShowInterstitial('completion', state, ctx())).toBe(false);
    expect(canShowInterstitial('completion', state, ctx({ now: new Date(2026, 9, 5, 9) }))).toBe(true);
  });
});

describe('ホーム⇔記録の遷移広告', () => {
  it('確率で出し分ける', () => {
    const p = DEFAULT_APP_CONFIG.ads.recordsTransitionProbability;
    expect(canShowInterstitial('recordsTransition', INITIAL_AD_THROTTLE_STATE, ctx({ random: p - 0.01 }))).toBe(true);
    expect(canShowInterstitial('recordsTransition', INITIAL_AD_THROTTLE_STATE, ctx({ random: p }))).toBe(false);
  });

  it('1日1回まで', () => {
    const state = markInterstitialShown('recordsTransition', INITIAL_AD_THROTTLE_STATE, now);
    const evening = new Date(2026, 9, 4, 20);
    expect(canShowInterstitial('recordsTransition', state, ctx({ now: evening }))).toBe(false);
    expect(canShowInterstitial('recordsTransition', state, ctx({ now: new Date(2026, 9, 5, 9) }))).toBe(true);
  });

  it('完了後広告の直後は出さない（行ったり来たり対策）', () => {
    const state = markInterstitialShown('completion', INITIAL_AD_THROTTLE_STATE, now);
    const soon = new Date(now.getTime() + 60 * 1000);
    expect(canShowInterstitial('recordsTransition', state, ctx({ now: soon }))).toBe(false);
  });
});

describe('markInterstitialShown', () => {
  it('日付が変わったらカウントを 1 から数え直す', () => {
    const state = { interstitialCountToday: 3, interstitialCountDate: '2026-10-03' };
    expect(markInterstitialShown('completion', state, now)).toMatchObject({
      interstitialCountToday: 1,
      interstitialCountDate: '2026-10-04',
    });
  });
});
