import { Pressable, View } from 'react-native';

import { BannerAdSlot } from '@/features/ads';
import { type WeekDay, WeekDots } from '@/features/records';
import { Screen } from '@/shared/components/Screen';
import { Text } from '@/shared/components/ui/text';
import { t } from '@/shared/i18n';

export type HomeScreenPresenterProps = {
  weekDays: WeekDay[];
  onStart: () => void;
};

/** ホームは「ダッシュボード」ではなく「スタートボタン」として見せる。 */
export function HomeScreenPresenter({ weekDays, onStart }: HomeScreenPresenterProps) {
  return (
    <Screen className="px-6">
      <View className="items-center gap-1 pt-10">
        <Text className="text-4xl font-extrabold tracking-tight">{t('app.name')}</Text>
        <Text variant="muted" className="text-base">
          {t('app.tagline')}
        </Text>
      </View>

      <View className="flex-1 items-center justify-center">
        <Pressable
          onPress={onStart}
          accessibilityRole="button"
          className="size-56 items-center justify-center rounded-full bg-primary shadow-lg shadow-black/20 active:scale-95 active:opacity-90">
          <Text className="text-4xl font-extrabold text-primary-foreground">{t('home.start')}</Text>
        </Pressable>
      </View>

      <View className="gap-4 pb-4">
        <View className="gap-3">
          <Text variant="muted">{t('home.thisWeek')}</Text>
          <WeekDots days={weekDays} />
        </View>
        <BannerAdSlot />
      </View>
    </Screen>
  );
}
