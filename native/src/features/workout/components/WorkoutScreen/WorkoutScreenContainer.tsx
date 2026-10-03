import type { CourseId, SetCount } from '@/shared/domain/workout';

import { useWorkoutScreen } from './useWorkoutScreen';
import { WorkoutScreenPresenter } from './WorkoutScreenPresenter';

export function WorkoutScreenContainer(props: { courseId: CourseId; setCount: SetCount }) {
  return <WorkoutScreenPresenter {...useWorkoutScreen(props)} />;
}
