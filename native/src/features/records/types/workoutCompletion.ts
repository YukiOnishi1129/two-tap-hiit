import { z } from 'zod';

import { COURSE_IDS, SET_COUNTS } from '@/shared/domain/workout';

export const WorkoutCompletionSchema = z.object({
  /** 完了したローカル日付 (YYYY-MM-DD) */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  courseId: z.enum(COURSE_IDS),
  setCount: z.literal(SET_COUNTS),
  /** 完了時刻 (ISO 8601) */
  completedAt: z.string(),
});
export type WorkoutCompletion = z.infer<typeof WorkoutCompletionSchema>;

export const WorkoutCompletionListSchema = z.array(WorkoutCompletionSchema);
