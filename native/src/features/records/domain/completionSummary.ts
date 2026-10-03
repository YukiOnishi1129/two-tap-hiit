import { getWorkoutDurationSec } from '@/shared/domain/workout';

import type { WorkoutCompletion } from '../types/workoutCompletion';

export type CompletionSummary = {
  completedSets: number;
  durationSec: number;
  /** 途中でやめた回か */
  endedEarly: boolean;
};

/** 保存データから表示用の要約を作る。古いデータ（項目なし）は最後までやった扱い。 */
export function summarizeCompletion(completion: WorkoutCompletion): CompletionSummary {
  const completedSets = Math.min(completion.completedSets ?? completion.setCount, completion.setCount);
  return {
    completedSets,
    durationSec: completion.durationSec ?? getWorkoutDurationSec(completion.setCount),
    endedEarly: completion.durationSec !== undefined && completion.durationSec < getWorkoutDurationSec(completion.setCount),
  };
}
