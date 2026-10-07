import { mergeWorkoutResult } from '../domain/mergeWorkoutResult';
import { type WorkoutCompletion, WorkoutCompletionListSchema, type WorkoutResult } from '../types/workoutCompletion';

import { readJson, writeJson } from '@/shared/lib/storage';

const KEY = 'workoutCompletions:v1';

export function listWorkoutCompletions(): Promise<WorkoutCompletion[]> {
  return readJson(KEY, WorkoutCompletionListSchema, []);
}

/** ワークアウトの結果を保存し、保存（または「もう1セット」で更新）した記録を返す。 */
export async function saveWorkoutResult(result: WorkoutResult, now: Date = new Date()): Promise<WorkoutCompletion> {
  const current = await listWorkoutCompletions();
  const newId = `${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const { completions, saved } = mergeWorkoutResult(current, result, now, newId);
  await writeJson(KEY, completions);
  return saved;
}
