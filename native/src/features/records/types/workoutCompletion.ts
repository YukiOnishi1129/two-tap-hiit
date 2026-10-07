import { z } from 'zod';

import { COURSE_IDS } from '@/shared/domain/workout';

export const WorkoutCompletionSchema = z.object({
  /** 記録の ID（「もう1セット」で足し算する先を指すのに使う）。古いデータには無い → completedAt で代用 */
  id: z.string().optional(),
  /** 完了したローカル日付 (YYYY-MM-DD)。「もう1セット」を足しても最初の日付のまま */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  courseId: z.enum(COURSE_IDS),
  /** sets: セット数を決めて始めた / free: フリー。古いデータには無い → sets */
  mode: z.enum(['sets', 'free']).optional(),
  /**
   * 予定していたセット数（「もう1セット」の分も足した数）。
   * フリーは予定が無いので、終えたセット数と同じ値を入れる。
   */
  setCount: z.number().int().min(0),
  /** 完了（または途中で終了）した時刻 (ISO 8601)。「もう1セット」を足したら更新する */
  completedAt: z.string(),
  /** 最後までできたセット数。古いデータには無い → setCount と同じ（最後までやった扱い） */
  completedSets: z.number().int().min(0).optional(),
  /** 実際に動いた秒数（開始前カウントダウン・一時停止を除く）。古いデータには無い → 予定どおりの時間 */
  durationSec: z.number().int().min(0).optional(),
});
export type WorkoutCompletion = z.infer<typeof WorkoutCompletionSchema>;

export const WorkoutCompletionListSchema = z.array(WorkoutCompletionSchema);

/** ワークアウト1回分の結果（保存する前の形） */
export type WorkoutResult = {
  courseId: WorkoutCompletion['courseId'];
  mode: 'sets' | 'free';
  /** 予定していたセット数（フリーは 0） */
  plannedSets: number;
  completedSets: number;
  durationSec: number;
  /** 「もう1セット」のとき、足し算する先の記録の ID */
  extendsId: string | null;
};
