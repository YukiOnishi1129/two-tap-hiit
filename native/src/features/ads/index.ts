// ads feature の公開 API。他の feature / app からはここ経由で使う。
export { BannerAdSlot } from './components/BannerAdSlot';
export { MockInterstitialHost } from './components/MockInterstitialHost';
export { type InterstitialResult, tryShowInterstitial } from './lib/adService';
