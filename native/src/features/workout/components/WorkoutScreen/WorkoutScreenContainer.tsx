import type { WorkoutParams } from '@/shared/domain/workout';

import { useWorkoutScreen } from './useWorkoutScreen';
import { WorkoutScreenPresenter } from './WorkoutScreenPresenter';

export function WorkoutScreenContainer(props: WorkoutParams) {
  return <WorkoutScreenPresenter {...useWorkoutScreen(props)} />;
}
