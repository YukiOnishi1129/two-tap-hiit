import { Pressable, View } from 'react-native';

import { BannerAdSlot } from '@/features/ads';
import { Screen } from '@/shared/components/Screen';
import { Text } from '@/shared/components/ui/text';
import { type CourseId, getWorkoutDurationSec, SET_CHOICES, type SetChoice } from '@/shared/domain/workout';
import { formatSetCount, t } from '@/shared/i18n';

import { courseName } from '../../lib/labels';

export type SetSelectScreenPresenterProps = {
  courseId: CourseId;
  onSelect: (sets: SetChoice) => void;
};

export function SetSelectScreenPresenter({ courseId, onSelect }: SetSelectScreenPresenterProps) {
  return (
    <Screen className="px-5">
      <View className="flex-1 justify-center gap-5 pb-4">
        <View className="items-center gap-1">
          <Text variant="muted" className="text-base">
            {courseName(courseId)}
          </Text>
          <Text variant="muted">{t('sets.note')}</Text>
        </View>
        {/* 2列: フリー・1 / 2・4 / 6・8 */}
        <View className="flex-row flex-wrap justify-between gap-y-3">
          {SET_CHOICES.map((choice) => (
            <SetChoiceButton key={String(choice)} choice={choice} onPress={() => onSelect(choice)} />
          ))}
        </View>
      </View>
      {/* 選択画面のバナー（この画面から次へ進むときに全画面広告は出さない） */}
      <View className="pb-4">
        <BannerAdSlot />
      </View>
    </Screen>
  );
}

function SetChoiceButton({ choice, onPress }: { choice: SetChoice; onPress: () => void }) {
  const isFree = choice === 'free';
  const label = isFree ? t('sets.free') : formatSetCount(choice);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="aspect-[4/3] w-[48%] items-center justify-center gap-0.5 rounded-lg border-2 border-border bg-card active:border-primary active:bg-accent">
      <Text className="text-5xl font-extrabold">{isFree ? '∞' : choice}</Text>
      <Text className="text-base font-semibold">{label}</Text>
      <Text variant="muted">
        {isFree ? t('sets.freeNote') : t('sets.duration', { minutes: Math.max(1, Math.round(getWorkoutDurationSec(choice) / 60)) })}
      </Text>
    </Pressable>
  );
}
