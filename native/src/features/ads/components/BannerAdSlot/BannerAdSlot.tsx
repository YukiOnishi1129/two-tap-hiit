import { View } from 'react-native';

import { Text } from '@/shared/components/ui/text';
import { t } from '@/shared/i18n';

import { adsMode } from '../../lib/interstitialAdClient';

/**
 * バナー広告の置き場所。いまはプレースホルダー。
 * AdMob 導入時に BannerAd に差し替える。ワークアウト画面には置かない。
 */
export function BannerAdSlot() {
  if (adsMode === 'off') return null;
  return (
    // 開発中だけ出す「ここにバナー広告が入る」目印。押せるものに見えないよう、角丸・枠線なしの帯にする
    <View pointerEvents="none" className="h-[50px] items-center justify-center bg-muted/60">
      <Text variant="muted" className="text-xs">
        {t('ad.banner')}
      </Text>
    </View>
  );
}
