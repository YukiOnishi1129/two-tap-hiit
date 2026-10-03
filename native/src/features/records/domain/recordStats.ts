import type { WorkoutCompletion } from '../types/workoutCompletion';
import { addDays, type DateKey, getWeekDateKeys, toDateKey } from '@/shared/lib/date';

// 記録の集計。回数ではなく「運動した日数」で数える（1日に2回やっても1日）。

export type WeekDay = { date: DateKey; done: boolean; isToday: boolean };

export function getCompletedDates(completions: WorkoutCompletion[]): Set<DateKey> {
  return new Set(completions.map((c) => c.date));
}

export function getWeekDays(completedDates: Set<DateKey>, today: Date): WeekDay[] {
  const todayKey = toDateKey(today);
  return getWeekDateKeys(today).map((date) => ({
    date,
    done: completedDates.has(date),
    isToday: date === todayKey,
  }));
}

export function countWeekDays(completedDates: Set<DateKey>, today: Date): number {
  return getWeekDateKeys(today).filter((date) => completedDates.has(date)).length;
}

/** month は 0 始まり */
export function countMonthDays(completedDates: Set<DateKey>, year: number, month: number): number {
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}-`;
  return [...completedDates].filter((date) => date.startsWith(prefix)).length;
}

/**
 * 連続日数。今日まだやっていなくても、昨日まで続いていれば途切れていない扱いにする
 * （朝に開いて「連続 0日」と出ると罪悪感があるので）。
 */
export function countStreak(completedDates: Set<DateKey>, today: Date): number {
  let cursor = completedDates.has(toDateKey(today)) ? today : addDays(today, -1);
  let streak = 0;
  while (completedDates.has(toDateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
