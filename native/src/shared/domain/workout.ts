// アプリ全体（features / external の両方）で共有するワークアウトの基本定義。

export const COURSE_IDS = ['standard', 'quiet'] as const;
export type CourseId = (typeof COURSE_IDS)[number];

export const SET_COUNTS = [2, 4, 6, 8] as const;
export type SetCount = (typeof SET_COUNTS)[number];

export type ExerciseId = 'burpee' | 'mountainClimber' | 'noJumpBurpee' | 'squat';

export type Course = {
  id: CourseId;
  exercises: readonly [ExerciseId, ExerciseId];
};

export const COURSES: Record<CourseId, Course> = {
  standard: { id: 'standard', exercises: ['burpee', 'mountainClimber'] },
  quiet: { id: 'quiet', exercises: ['noJumpBurpee', 'squat'] },
};

export const EXERCISE_SECONDS = 30;
export const REST_SECONDS = 15;

export function isCourseId(value: unknown): value is CourseId {
  return COURSE_IDS.includes(value as CourseId);
}

export function parseSetCount(value: unknown): SetCount | null {
  const n = Number(value);
  return SET_COUNTS.includes(n as SetCount) ? (n as SetCount) : null;
}

/** ルートパラメータ（文字列）からコースとセット数を取り出す。不正なら null。 */
export function parseWorkoutParams(
  course: string | string[] | undefined,
  sets: string | string[] | undefined,
): { courseId: CourseId; setCount: SetCount } | null {
  const setCount = parseSetCount(sets);
  if (!isCourseId(course) || setCount === null) return null;
  return { courseId: course, setCount };
}

/**
 * 運動している時間の合計（秒）。最後のセットの後ろの休憩は含めない。
 * 例: 2セット = 30+15+30+15+30+15+30 = 165秒
 */
export function getWorkoutDurationSec(setCount: SetCount): number {
  const intervals = setCount * 2;
  return intervals * EXERCISE_SECONDS + (intervals - 1) * REST_SECONDS;
}

/** 途中でやめたときの記録内容 */
export type EarlyEnd = { completedSets: number; durationSec: number };

/**
 * 完了画面のルートパラメータから「途中でやめた」情報を取り出す。
 * パラメータが無ければ最後までやった扱い（null）。
 */
export function parseEarlyEnd(
  doneSets: string | string[] | undefined,
  sec: string | string[] | undefined,
  setCount: SetCount,
): EarlyEnd | null {
  if (doneSets === undefined || sec === undefined) return null;
  const completedSets = Number(doneSets);
  const durationSec = Number(sec);
  if (!Number.isInteger(completedSets) || !Number.isInteger(durationSec)) return null;
  return {
    completedSets: Math.min(Math.max(completedSets, 0), setCount),
    durationSec: Math.min(Math.max(durationSec, 0), getWorkoutDurationSec(setCount)),
  };
}
