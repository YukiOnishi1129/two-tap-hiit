// ads feature の公開 API。他の feature / app からはここ経由で使う。
export { AdsBootstrap } from './components/AdsBootstrap';
export { BannerAdSlot } from './components/BannerAdSlot';
export { type InterstitialResult, tryShowInterstitial } from './lib/adService';
