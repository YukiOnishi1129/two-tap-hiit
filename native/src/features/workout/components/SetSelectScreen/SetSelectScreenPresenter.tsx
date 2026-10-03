import { Pressable, View } from 'react-native';

import { Screen } from '@/shared/components/Screen';
import { Text } from '@/shared/components/ui/text';
import { type CourseId, getWorkoutDurationSec, SET_COUNTS, type SetCount } from '@/shared/domain/workout';
import { t } from '@/shared/i18n';

import { courseName } from '../../lib/labels';

export type SetSelectScreenPresenterProps = {
  courseId: CourseId;
  onSelect: (setCount: SetCount) => void;
};

export function SetSelectScreenPresenter({ courseId, onSelect }: SetSelectScreenPresenterProps) {
  return (
    <Screen className="px-5">
      <View className="flex-1 justify-center gap-6 pb-8">
        <View className="items-center gap-1">
          <Text variant="muted" className="text-base">
            {courseName(courseId)}
          </Text>
          <Text variant="muted">{t('sets.note')}</Text>
        </View>
        <View className="flex-row flex-wrap justify-between gap-y-4">
          {SET_COUNTS.map((count) => (
            <Pressable
              key={count}
              onPress={() => onSelect(count)}
              accessibilityRole="button"
              accessibilityLabel={t('sets.count', { count })}
              className="aspect-square w-[48%] items-center justify-center gap-1 rounded-lg border-2 border-border bg-card active:border-primary active:bg-accent">
              <Text className="text-6xl font-extrabold">{count}</Text>
              <Text className="text-base font-semibold">{t('sets.count', { count })}</Text>
              <Text variant="muted">
                {t('sets.duration', { minutes: Math.round(getWorkoutDurationSec(count) / 60) })}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}
