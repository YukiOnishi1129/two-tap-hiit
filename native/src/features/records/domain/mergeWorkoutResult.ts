import type { WorkoutCompletion, WorkoutResult } from '../types/workoutCompletion';
import { completionId, summarizeCompletion } from './completionSummary';
import { toDateKey } from '@/shared/lib/date';

/**
 * ワークアウトの結果を記録の一覧に反映する。
 * - 通常: 新しい記録として追加する
 * - 「もう1セット」(extendsId あり): 足し算する先の記録にセット数と時間を足す（記録は増やさない）
 *   足し算する先が見つからない場合は、新しい記録として追加する
 *
 * 戻り値は、更新後の一覧と、今回保存（または更新）した記録。
 */
export function mergeWorkoutResult(
  completions: WorkoutCompletion[],
  result: WorkoutResult,
  now: Date,
  newId: string,
): { completions: WorkoutCompletion[]; saved: WorkoutCompletion } {
  const targetIndex =
    result.extendsId === null ? -1 : completions.findIndex((c) => completionId(c) === result.extendsId);
  const target = completions[targetIndex];

  if (target) {
    const base = summarizeCompletion(target);
    const completedSets = base.completedSets + result.completedSets;
    const saved: WorkoutCompletion = {
      ...target,
      id: completionId(target),
      mode: base.mode,
      // フリーは予定が無いので、終えたセット数をそのまま入れる
      setCount: base.mode === 'free' ? completedSets : base.setCount + result.plannedSets,
      completedSets,
      durationSec: base.durationSec + result.durationSec,
      completedAt: now.toISOString(),
    };
    return { completions: completions.map((c, i) => (i === targetIndex ? saved : c)), saved };
  }

  const saved: WorkoutCompletion = {
    id: newId,
    date: toDateKey(now),
    courseId: result.courseId,
    mode: result.mode,
    setCount: result.mode === 'free' ? result.completedSets : result.plannedSets,
    completedAt: now.toISOString(),
    completedSets: result.completedSets,
    durationSec: result.durationSec,
  };
  return { completions: [...completions, saved], saved };
}
