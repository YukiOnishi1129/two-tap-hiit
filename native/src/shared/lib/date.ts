// 日付まわりのユーティリティ。記録は端末のローカル日付 (YYYY-MM-DD) で扱う。

export type DateKey = string; // YYYY-MM-DD

export function toDateKey(date: Date): DateKey {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function fromDateKey(key: DateKey): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + days);
  return next;
}

/** 週の始まりは月曜日。 */
export function startOfWeek(date: Date): Date {
  const mondayOffset = (date.getDay() + 6) % 7;
  return addDays(date, -mondayOffset);
}

/** date を含む週（月〜日）の7日分の DateKey。 */
export function getWeekDateKeys(date: Date): DateKey[] {
  const monday = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => toDateKey(addDays(monday, i)));
}

/**
 * 月カレンダー用のマス目。月曜始まりで、月外のマスは null。
 * month は 0 始まり（Date と同じ）。
 */
export function getMonthGrid(year: number, month: number): (DateKey | null)[][] {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leading = (first.getDay() + 6) % 7;

  const cells: (DateKey | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => toDateKey(new Date(year, month, i + 1))),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (DateKey | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}
