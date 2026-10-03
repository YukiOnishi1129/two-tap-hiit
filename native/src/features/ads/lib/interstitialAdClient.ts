// インタースティシャル広告のクライアント。
// 今はモック実装で、画面側 (MockInterstitialHost) が登録した表示関数を呼ぶだけ。
// AdMob を導入するときは、このファイルの中身を react-native-google-mobile-ads の
// InterstitialAd に差し替える（呼び出し側のインターフェースは変えない）。

export type AdsMode = 'mock' | 'off';

/** EXPO_PUBLIC_ADS_MODE で切り替え。未指定なら開発中は mock、本番は off。 */
export const adsMode: AdsMode =
  process.env.EXPO_PUBLIC_ADS_MODE === 'mock' || process.env.EXPO_PUBLIC_ADS_MODE === 'off'
    ? process.env.EXPO_PUBLIC_ADS_MODE
    : __DEV__
      ? 'mock'
      : 'off';

type Presenter = () => Promise<void>;

let mockPresenter: Presenter | null = null;

export function registerMockInterstitialPresenter(presenter: Presenter): () => void {
  mockPresenter = presenter;
  return () => {
    if (mockPresenter === presenter) mockPresenter = null;
  };
}

export function isInterstitialAvailable(): boolean {
  return adsMode === 'mock' && mockPresenter !== null;
}

/** 広告を表示し、閉じられたら resolve する。表示できない場合はすぐ resolve する。 */
export async function showInterstitial(): Promise<void> {
  if (!isInterstitialAvailable() || !mockPresenter) return;
  await mockPresenter();
}
