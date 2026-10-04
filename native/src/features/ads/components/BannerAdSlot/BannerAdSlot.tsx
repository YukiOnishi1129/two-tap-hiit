import { useRef, useState, useSyncExternalStore } from 'react';
import { Platform, View } from 'react-native';
import { BannerAd, BannerAdSize, useForeground } from 'react-native-google-mobile-ads';

import { isAdsReady, subscribeAdsReady } from '../../lib/admobClient';
import { getAdUnitId } from '../../lib/adUnits';

/**
 * バナー広告。ワークアウト画面と設定画面には置かない。
 * 画面の左右の余白の中に収まるよう、固定サイズ (320×50) を中央に置く。
 * 広告を出せない（オフ・未初期化・読み込み失敗）ときは何も表示しない。
 */
export function BannerAdSlot() {
  const ready = useSyncExternalStore(subscribeAdsReady, isAdsReady);
  const [failed, setFailed] = useState(false);
  const bannerRef = useRef<BannerAd>(null);
  const unitId = getAdUnitId('banner');

  // iOS はバックグラウンドから戻ると広告が空になることがあるので読み込み直す
  useForeground(() => {
    if (Platform.OS === 'ios') bannerRef.current?.load();
  });

  if (!unitId || !ready || failed) return null;

  return (
    <View className="items-center">
      <BannerAd
        ref={bannerRef}
        unitId={unitId}
        size={BannerAdSize.BANNER}
        onAdLoaded={() => setFailed(false)}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}
