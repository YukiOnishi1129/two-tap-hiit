import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { formatDay, formatDuration, formatSetCount, formatTime, t } from '@/shared/i18n';
import { type DateKey, fromDateKey, getMonthGrid, toDateKey } from '@/shared/lib/date';

import { completionId, summarizeCompletion } from '../../domain/completionSummary';
import { countMonthDays, countStreak, countWeekDays, getCompletedDates, getDayCompletions } from '../../domain/recordStats';
import { listWorkoutCompletions } from '../../repository/workoutCompletionRepository';
import type { WorkoutCompletion } from '../../types/workoutCompletion';

/** 選んだ日の記録1件分（表示用） */
export type DayEntry = {
  key: string;
  time: string;
  courseName: string;
  detail: string;
  endedEarly: boolean;
};

function toDayEntry(completion: WorkoutCompletion): DayEntry {
  const summary = summarizeCompletion(completion);
  const duration = formatDuration(summary.durationSec);
  const detail =
    summary.mode === 'free'
      ? t('records.entryFree', { sets: formatSetCount(summary.completedSets), duration })
      : summary.endedEarly
        ? t('records.entryPartial', { done: summary.completedSets, total: summary.setCount, duration })
        : t('records.entry', { sets: formatSetCount(summary.completedSets), duration });
  return {
    key: completionId(completion),
    time: formatTime(new Date(completion.completedAt)),
    courseName: t(`course.${completion.courseId}.name`),
    detail,
    endedEarly: summary.endedEarly,
  };
}

export function useRecordsScreen() {
  const [today] = useState(() => new Date());
  const [completions, setCompletions] = useState<WorkoutCompletion[]>([]);
  const [month, setMonth] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const todayKey = toDateKey(today);
  const [selectedDate, setSelectedDate] = useState<DateKey>(todayKey);

  useFocusEffect(
    useCallback(() => {
      void listWorkoutCompletions().then(setCompletions);
    }, []),
  );

  const completedDates = useMemo(() => getCompletedDates(completions), [completions]);
  const dayEntries = useMemo(
    () => getDayCompletions(completions, selectedDate).map(toDayEntry),
    [completions, selectedDate],
  );
  const isCurrentMonth = month.year === today.getFullYear() && month.month === today.getMonth();

  const shiftMonth = (delta: number) =>
    setMonth(({ year, month: m }) => {
      const d = new Date(year, m + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  return {
    year: month.year,
    month: month.month,
    weeks: getMonthGrid(month.year, month.month),
    completedDates,
    todayKey,
    selectedDate,
    selectedDateLabel: formatDayLabel(selectedDate),
    dayEntries,
    // 未来の日は選べない
    onSelectDate: (date: DateKey) => {
      if (date <= todayKey) setSelectedDate(date);
    },
    weekCount: countWeekDays(completedDates, today),
    monthCount: countMonthDays(completedDates, month.year, month.month),
    streak: countStreak(completedDates, today),
    isEmpty: completions.length === 0,
    canGoNext: !isCurrentMonth,
    onPrevMonth: () => shiftMonth(-1),
    onNextMonth: () => shiftMonth(1),
  };
}

function formatDayLabel(date: DateKey): string {
  return formatDay(fromDateKey(date));
}
