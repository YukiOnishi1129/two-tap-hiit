// アプリ全体（features / external の両方）で共有するワークアウトの基本定義。

export const COURSE_IDS = ['standard', 'quiet'] as const;
export type CourseId = (typeof COURSE_IDS)[number];

export const SET_COUNTS = [1, 2, 4, 6, 8] as const;
export type SetCount = (typeof SET_COUNTS)[number];

/** セット数の選び方。決まったセット数か、自分で「おわる」まで続けるフリー */
export type SetChoice = SetCount | 'free';

/** セット数選択画面の並び順（2列: フリー・1 / 2・4 / 6・8） */
export const SET_CHOICES: readonly SetChoice[] = ['free', 1, 2, 4, 6, 8];

/** フリーの上限（実質無制限。99セットで約2時間20分） */
export const FREE_MAX_SETS = 99;

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

export function parseSetChoice(value: unknown): SetChoice | null {
  if (value === 'free') return 'free';
  const n = Number(value);
  return SET_COUNTS.includes(n as SetCount) ? (n as SetCount) : null;
}

/** タイマーで組むセット数。フリーは上限まで組んでおき、ユーザーが「おわる」で止める */
export function plannedSetCount(choice: SetChoice): number {
  return choice === 'free' ? FREE_MAX_SETS : choice;
}

export type WorkoutParams = {
  courseId: CourseId;
  sets: SetChoice;
  /** 「もう1セット」のとき、足し算する先の記録の ID。通常は null */
  extendsId: string | null;
};

const single = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

/** ルートパラメータ（文字列）からワークアウトの内容を取り出す。不正なら null。 */
export function parseWorkoutParams(
  course: string | string[] | undefined,
  sets: string | string[] | undefined,
  extend?: string | string[] | undefined,
): WorkoutParams | null {
  const choice = parseSetChoice(single(sets));
  const courseId = single(course);
  if (!isCourseId(courseId) || choice === null) return null;
  return { courseId, sets: choice, extendsId: single(extend) || null };
}

/**
 * 運動している時間の合計（秒）。最後のセットの後ろの休憩は含めない。
 * 例: 2セット = 30+15+30+15+30+15+30 = 165秒
 */
export function getWorkoutDurationSec(setCount: number): number {
  if (setCount <= 0) return 0;
  const intervals = setCount * 2;
  return intervals * EXERCISE_SECONDS + (intervals - 1) * REST_SECONDS;
}

/** 実際にやった内容（途中でやめた・フリーで終えた場合）。予定どおり最後までやった場合は使わない */
export type WorkoutOutcome = { completedSets: number; durationSec: number };

/**
 * 完了画面のルートパラメータから「実際にやった内容」を取り出す。
 * パラメータが無ければ予定どおり最後までやった扱い（null）。
 */
export function parseWorkoutOutcome(
  doneSets: string | string[] | undefined,
  sec: string | string[] | undefined,
  maxSets: number,
): WorkoutOutcome | null {
  const doneSetsValue = single(doneSets);
  const secValue = single(sec);
  if (doneSetsValue === undefined || secValue === undefined) return null;
  const completedSets = Number(doneSetsValue);
  const durationSec = Number(secValue);
  if (!Number.isInteger(completedSets) || !Number.isInteger(durationSec)) return null;
  return {
    completedSets: Math.min(Math.max(completedSets, 0), maxSets),
    durationSec: Math.min(Math.max(durationSec, 0), getWorkoutDurationSec(maxSets)),
  };
}
