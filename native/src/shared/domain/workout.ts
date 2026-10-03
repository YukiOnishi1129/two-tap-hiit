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
