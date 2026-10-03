import { z } from 'zod';

import { COURSE_IDS, SET_COUNTS } from '@/shared/domain/workout';

export const WorkoutCompletionSchema = z.object({
  /** 完了したローカル日付 (YYYY-MM-DD) */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  courseId: z.enum(COURSE_IDS),
  setCount: z.literal(SET_COUNTS),
  /** 完了（または途中で終了）した時刻 (ISO 8601) */
  completedAt: z.string(),
  /**
   * 最後までできたセット数。途中でやめた場合は setCount より小さい。
   * 古いデータには無い → 最後までやった扱い。
   */
  completedSets: z.number().int().min(0).optional(),
  /** 実際に動いた秒数（開始前カウントダウン・一時停止を除く）。古いデータには無い → 予定どおりの時間 */
  durationSec: z.number().int().min(0).optional(),
});
export type WorkoutCompletion = z.infer<typeof WorkoutCompletionSchema>;

export const WorkoutCompletionListSchema = z.array(WorkoutCompletionSchema);
