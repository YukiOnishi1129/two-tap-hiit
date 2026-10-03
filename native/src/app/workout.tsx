import { Redirect, useLocalSearchParams } from 'expo-router';

import { WorkoutScreen } from '@/features/workout';
import { parseWorkoutParams } from '@/shared/domain/workout';

export default function WorkoutRoute() {
  const { course, sets } = useLocalSearchParams<{ course?: string; sets?: string }>();
  const params = parseWorkoutParams(course, sets);
  if (!params) return <Redirect href="/" />;
  return <WorkoutScreen {...params} />;
}
