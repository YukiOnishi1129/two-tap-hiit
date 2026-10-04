import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

// 広告の出し方の切り替え。EXPO_PUBLIC_ADS_MODE で指定する。
// - admob: 本番の広告ユニット ID で配信
// - test:  Google 公式のテスト ID で配信（本物の SDK でテスト広告が出る。開発中はこれ）
// - off:   広告を出さない
export type AdsMode = 'admob' | 'test' | 'off';

export const adsMode: AdsMode =
  process.env.EXPO_PUBLIC_ADS_MODE === 'admob' ||
  process.env.EXPO_PUBLIC_ADS_MODE === 'test' ||
  process.env.EXPO_PUBLIC_ADS_MODE === 'off'
    ? process.env.EXPO_PUBLIC_ADS_MODE
    : __DEV__
      ? 'test'
      : 'admob';

export type AdFormat = 'banner' | 'interstitial';

/**
 * AdMob の管理画面で作った広告ユニット ID。秘密情報ではないのでコードに置いてよい。
 * TODO: AdMob で発行したら差し替える（空のあいだは本番モードでも広告を出さない）。
 * アプリ ID は app.json の react-native-google-mobile-ads プラグイン設定にある。
 */
const PRODUCTION_UNIT_IDS: Record<'ios' | 'android', Record<AdFormat, string>> = {
  ios: { banner: '', interstitial: '' },
  android: { banner: '', interstitial: '' },
};

const TEST_UNIT_IDS: Record<AdFormat, string> = {
  banner: TestIds.BANNER,
  interstitial: TestIds.INTERSTITIAL,
};

/** 使う広告ユニット ID。広告を出さない場合は null。 */
export function getAdUnitId(format: AdFormat): string | null {
  if (adsMode === 'off') return null;
  if (adsMode === 'test') return TEST_UNIT_IDS[format];
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return null;
  return PRODUCTION_UNIT_IDS[Platform.OS][format] || null;
}

export const adsEnabled = getAdUnitId('banner') !== null || getAdUnitId('interstitial') !== null;
