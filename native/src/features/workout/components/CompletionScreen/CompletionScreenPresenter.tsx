import { View } from 'react-native';

import { Screen } from '@/shared/components/Screen';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Text } from '@/shared/components/ui/text';
import type { CourseId, SetCount } from '@/shared/domain/workout';
import { formatDuration, t } from '@/shared/i18n';

import { courseName } from '../../lib/labels';

export type CompletionScreenPresenterProps = {
  courseId: CourseId;
  setCount: SetCount;
  totalSec: number;
  onHome: () => void;
};

export function CompletionScreenPresenter({ courseId, setCount, totalSec, onHome }: CompletionScreenPresenterProps) {
  return (
    <Screen className="px-6">
      <View className="flex-1 items-center justify-center gap-8">
        <View className="items-center gap-2">
          <Text className="text-6xl">🎉</Text>
          <Text className="text-5xl font-extrabold">{t('complete.title')}</Text>
          <Text variant="muted" className="text-lg">
            {t('complete.message')}
          </Text>
        </View>

        <Card className="w-full py-2">
          <CardContent className="px-5">
            <SummaryRow label={t('complete.course')} value={courseName(courseId)} />
            <SummaryRow label={t('complete.sets')} value={t('sets.count', { count: setCount })} />
            <SummaryRow label={t('complete.time')} value={formatDuration(totalSec)} last />
          </CardContent>
        </Card>
      </View>

      <View className="pb-6">
        <Button size="lg" className="h-16" onPress={onHome}>
          <Text className="text-lg font-bold">{t('complete.home')}</Text>
        </Button>
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
