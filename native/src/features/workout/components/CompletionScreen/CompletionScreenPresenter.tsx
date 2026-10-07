import { View } from 'react-native';

import { BannerAdSlot } from '@/features/ads';
import { Screen } from '@/shared/components/Screen';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Text } from '@/shared/components/ui/text';
import type { CourseId } from '@/shared/domain/workout';
import { formatDuration, formatSetCount, t } from '@/shared/i18n';

import { courseName } from '../../lib/labels';

export type CompletionScreenPresenterProps = {
  courseId: CourseId;
  mode: 'sets' | 'free';
  /** 予定していたセット数（「もう1セット」の分も含む） */
  setCount: number;
  /** 最後までできたセット数（途中でやめた場合は setCount より小さい） */
  completedSets: number;
  totalSec: number;
  endedEarly: boolean;
  onHome: () => void;
  onOneMore: () => void;
};

export function CompletionScreenPresenter({
  courseId,
  mode,
  setCount,
  completedSets,
  totalSec,
  endedEarly,
  onHome,
  onOneMore,
}: CompletionScreenPresenterProps) {
  const setsValue =
    mode === 'free'
      ? t('complete.setsFree', { sets: formatSetCount(completedSets) })
      : endedEarly
        ? t('complete.setsPartial', { done: completedSets, total: setCount })
        : formatSetCount(completedSets);

  return (
    <Screen className="px-6">
      <View className="flex-1 items-center justify-center gap-8">
        <View className="items-center gap-2">
          <Text className="text-6xl">🎉</Text>
          <Text className="text-5xl font-extrabold">{t('complete.title')}</Text>
          <Text variant="muted" className="text-lg">
            {endedEarly ? t('complete.messageEarly') : t('complete.message')}
          </Text>
        </View>

        <Card className="w-full py-2">
          <CardContent className="px-5">
            <SummaryRow label={t('complete.course')} value={courseName(courseId)} />
            <SummaryRow label={t('complete.sets')} value={setsValue} />
            <SummaryRow label={t('complete.time')} value={formatDuration(totalSec)} last />
          </CardContent>
        </Card>
      </View>

      <View className="gap-3 pb-4">
        {/* やる気が残っていれば、同じコースで1セット追加（広告は挟まない） */}
        <Button variant="outline" size="lg" className="h-14" onPress={onOneMore}>
          <Text className="text-lg font-bold">{t('complete.oneMore')}</Text>
        </Button>
        <Button size="lg" className="h-16" onPress={onHome}>
          <Text className="text-lg font-bold">{t('complete.home')}</Text>
        </Button>
        <BannerAdSlot />
      </View>
    </Screen>
  );
}

function SummaryRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <View className={`flex-row items-center justify-between py-3 ${last ? '' : 'border-b border-border'}`}>
      <Text variant="muted" className="text-base">
        {label}
      </Text>
      <Text className="text-lg font-semibold">{value}</Text>
    </View>
  );
}
