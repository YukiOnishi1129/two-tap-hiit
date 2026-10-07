import { getWorkoutDurationSec } from '@/shared/domain/workout';

import type { WorkoutCompletion } from '../types/workoutCompletion';

export type CompletionSummary = {
  mode: 'sets' | 'free';
  /** 予定していたセット数（フリーは終えたセット数と同じ） */
  setCount: number;
  completedSets: number;
  durationSec: number;
  /** 途中でやめた回か（フリーは好きなところで終わるものなので常に false） */
  endedEarly: boolean;
};

/** 記録の ID。古いデータには id が無いので completedAt で代用する */
export function completionId(completion: WorkoutCompletion): string {
  return completion.id ?? completion.completedAt;
}

/** 保存データから表示用の要約を作る。古いデータ（項目なし）は最後までやった扱い。 */
export function summarizeCompletion(completion: WorkoutCompletion): CompletionSummary {
  const mode = completion.mode ?? 'sets';
  const completedSets =
    mode === 'free'
      ? (completion.completedSets ?? completion.setCount)
      : Math.min(completion.completedSets ?? completion.setCount, completion.setCount);
  return {
    mode,
    setCount: completion.setCount,
    completedSets,
    durationSec: completion.durationSec ?? getWorkoutDurationSec(completion.setCount),
    endedEarly: mode === 'sets' && completedSets < completion.setCount,
  };
}
