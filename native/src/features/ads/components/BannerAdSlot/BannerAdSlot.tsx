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
    <View className="h-[50px] items-center justify-center rounded-md border border-dashed border-border bg-muted">
      <Text variant="muted">{t('ad.banner')}</Text>
    </View>
  );
}
