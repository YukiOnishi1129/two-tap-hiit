import { Pressable, View } from 'react-native';

import { BannerAdSlot } from '@/features/ads';
import { Screen } from '@/shared/components/Screen';
import { Text } from '@/shared/components/ui/text';
import { COURSE_IDS, COURSES, type CourseId } from '@/shared/domain/workout';

import { courseDescription, courseName, exerciseName } from '../../lib/labels';

export type CourseSelectScreenPresenterProps = {
  onSelect: (courseId: CourseId) => void;
};

export function CourseSelectScreenPresenter({ onSelect }: CourseSelectScreenPresenterProps) {
  return (
    <Screen className="px-5">
      <View className="flex-1 justify-center gap-4 pb-4">
        {COURSE_IDS.map((id) => (
          <Pressable
            key={id}
            onPress={() => onSelect(id)}
            accessibilityRole="button"
            className="gap-3 rounded-lg border-2 border-border bg-card p-6 active:border-primary active:bg-accent">
            <View className="gap-1">
              <Text className="text-3xl font-extrabold">{courseName(id)}</Text>
              <Text variant="muted" className="text-base">
                {courseDescription(id)}
              </Text>
            </View>
            <View className="gap-1.5">
              {COURSES[id].exercises.map((exerciseId) => (
                <View key={exerciseId} className="flex-row items-center gap-2">
                  <View className="size-2 rounded-full bg-primary" />
                  <Text className="text-lg">{exerciseName(exerciseId)}</Text>
                </View>
              ))}
            </View>
          </Pressable>
        ))}
      </View>
      {/* 選択画面のバナー（この画面から次へ進むときに全画面広告は出さない） */}
      <View className="pb-4">
        <BannerAdSlot />
      </View>
    </Screen>
  );
}
