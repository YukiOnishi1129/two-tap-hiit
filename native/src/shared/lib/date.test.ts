import { addDays, fromDateKey, getMonthGrid, getWeekDateKeys, startOfWeek, toDateKey } from './date';

describe('date', () => {
  it('ローカル日付を YYYY-MM-DD にする', () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(toDateKey(fromDateKey('2026-12-31'))).toBe('2026-12-31');
  });

  it('月をまたいで日付を足せる', () => {
    expect(toDateKey(addDays(new Date(2026, 9, 31), 1))).toBe('2026-11-01');
  });

  it('週は月曜始まり', () => {
    // 2026-10-04 は日曜日
    expect(toDateKey(startOfWeek(new Date(2026, 9, 4)))).toBe('2026-09-28');
    expect(getWeekDateKeys(new Date(2026, 9, 4))).toEqual([
      '2026-09-28',
      '2026-09-29',
      '2026-09-30',
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
      '2026-10-04',
    ]);
  });

  it('月カレンダーのマス目を月曜始まりで作る', () => {
    // 2026年10月1日は木曜日
    const grid = getMonthGrid(2026, 9);
    expect(grid[0]).toEqual([null, null, null, '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04']);
    expect(grid.flat().filter(Boolean)).toHaveLength(31);
    expect(grid.every((week) => week.length === 7)).toBe(true);
  });
});
