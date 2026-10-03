import type { WorkoutCompletion } from '../types/workoutCompletion';

import {
  countMonthDays,
  countStreak,
  countWeekDays,
  getCompletedDates,
  getDayCompletions,
  getWeekDays,
} from './recordStats';

const completion = (date: string): WorkoutCompletion => ({
  date,
  courseId: 'standard',
  setCount: 4,
  completedAt: `${date}T08:00:00.000Z`,
});

// 2026-10-04 は日曜日。今週 = 9/28(月)〜10/4(日)
const today = new Date(2026, 9, 4, 10);
const dates = getCompletedDates(
  ['2026-09-27', '2026-09-30', '2026-10-01', '2026-10-01', '2026-10-03'].map(completion),
);

describe('recordStats', () => {
  it('同じ日の複数回は1日として数える', () => {
    expect(dates.size).toBe(4);
  });

  it('今週の7日分のドットを作る', () => {
    const days = getWeekDays(dates, today);
    expect(days.map((d) => d.done)).toEqual([false, false, true, true, false, true, false]);
    expect(days.at(-1)).toMatchObject({ date: '2026-10-04', isToday: true });
  });

  it('週・月の日数を数える', () => {
    expect(countWeekDays(dates, today)).toBe(3);
    expect(countMonthDays(dates, 2026, 9)).toBe(2);
    expect(countMonthDays(dates, 2026, 8)).toBe(2);
  });

  it('連続日数: 今日未実施でも昨日まで続いていれば数える', () => {
    expect(countStreak(dates, today)).toBe(1);
    expect(countStreak(getCompletedDates(['2026-10-02', '2026-10-03', '2026-10-04'].map(completion)), today)).toBe(3);
    expect(countStreak(getCompletedDates([completion('2026-10-01')]), today)).toBe(0);
  });
});

describe('getDayCompletions', () => {
  it('その日の記録だけを、やった順に返す', () => {
    const list: WorkoutCompletion[] = [
      { date: '2026-10-04', courseId: 'quiet', setCount: 2, completedAt: '2026-10-04T12:00:00.000Z' },
      { date: '2026-10-03', courseId: 'standard', setCount: 8, completedAt: '2026-10-03T09:00:00.000Z' },
      { date: '2026-10-04', courseId: 'standard', setCount: 4, completedAt: '2026-10-04T07:30:00.000Z' },
    ];
    expect(getDayCompletions(list, '2026-10-04').map((c) => [c.courseId, c.setCount])).toEqual([
      ['standard', 4],
      ['quiet', 2],
    ]);
    expect(getDayCompletions(list, '2026-10-05')).toEqual([]);
  });
});
