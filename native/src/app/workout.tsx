import { Redirect, useLocalSearchParams } from 'expo-router';

import { WorkoutScreen } from '@/features/workout';
import { parseWorkoutParams } from '@/shared/domain/workout';

export default function WorkoutRoute() {
  const { course, sets, extend } = useLocalSearchParams<{
    course?: string;
    /** 1〜8 または free */
    sets?: string;
    /** 「もう1セット」のとき、足し算する先の記録の ID */
    extend?: string;
  }>();
  const params = parseWorkoutParams(course, sets, extend);
  if (!params) return <Redirect href="/" />;
  return <WorkoutScreen {...params} />;
}
