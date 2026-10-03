import { type WorkoutCompletion, WorkoutCompletionListSchema } from '../types/workoutCompletion';

import { readJson, writeJson } from '@/shared/lib/storage';

const KEY = 'workoutCompletions:v1';

export function listWorkoutCompletions(): Promise<WorkoutCompletion[]> {
  return readJson(KEY, WorkoutCompletionListSchema, []);
}

export async function addWorkoutCompletion(completion: WorkoutCompletion): Promise<void> {
  const current = await listWorkoutCompletions();
  await writeJson(KEY, [...current, completion]);
}
