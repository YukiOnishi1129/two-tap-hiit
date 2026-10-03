import {
  COURSES,
  type CourseId,
  EXERCISE_SECONDS,
  type ExerciseId,
  REST_SECONDS,
  type SetCount,
} from '@/shared/domain/workout';

// ワークアウトの流れ（フェーズの並び）と、経過時間から「いまどこか」を求める純粋関数。
//
//   開始前カウントダウン 3秒
//   → [種目A 30秒 → 休憩 15秒 → 種目B 30秒 → 休憩 15秒] × セット数
//
// 最後の種目のあとの休憩は意味がないので入れず、そこで完了とする。

export const READY_SECONDS = 3;

export type Phase =
  | { kind: 'ready'; durationSec: number; nextExerciseId: ExerciseId }
  | { kind: 'exercise'; durationSec: number; exerciseId: ExerciseId; setNumber: number }
  | { kind: 'rest'; durationSec: number; nextExerciseId: ExerciseId; setNumber: number };

export function buildTimeline(courseId: CourseId, setCount: SetCount): Phase[] {
  const [first, second] = COURSES[courseId].exercises;
  const phases: Phase[] = [{ kind: 'ready', durationSec: READY_SECONDS, nextExerciseId: first }];

  for (let setNumber = 1; setNumber <= setCount; setNumber++) {
    const isLastSet = setNumber === setCount;
    phases.push(
      { kind: 'exercise', durationSec: EXERCISE_SECONDS, exerciseId: first, setNumber },
      { kind: 'rest', durationSec: REST_SECONDS, nextExerciseId: second, setNumber },
      { kind: 'exercise', durationSec: EXERCISE_SECONDS, exerciseId: second, setNumber },
    );
    if (!isLastSet) {
      phases.push({ kind: 'rest', durationSec: REST_SECONDS, nextExerciseId: first, setNumber });
    }
  }
  return phases;
}

export type TimelinePosition =
  | { done: true }
  | {
      done: false;
      phaseIndex: number;
      phase: Phase;
      /** 画面に出す残り秒数（切り上げ）。30.0〜29.01秒 → 30 */
      remainingSec: number;
      /** フェーズの進み具合 0〜1 */
      progress: number;
    };

/** 一時停止を除いた経過ミリ秒から、現在のフェーズと残り秒数を求める。 */
export function getTimelinePosition(phases: Phase[], elapsedMs: number): TimelinePosition {
  let phaseStartMs = 0;
  for (const [phaseIndex, phase] of phases.entries()) {
    const durationMs = phase.durationSec * 1000;
    const phaseEndMs = phaseStartMs + durationMs;
    if (elapsedMs < phaseEndMs) {
      const inPhaseMs = Math.max(0, elapsedMs - phaseStartMs);
      return {
        done: false,
        phaseIndex,
        phase,
        remainingSec: Math.ceil((durationMs - inPhaseMs) / 1000),
        progress: inPhaseMs / durationMs,
      };
    }
    phaseStartMs = phaseEndMs;
  }
  return { done: true };
}
