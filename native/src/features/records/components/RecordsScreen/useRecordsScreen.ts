import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';

import { tryShowInterstitial } from '@/features/ads';
import { DEFAULT_PREFERENCES, getPreferences, type Preferences, savePreferences } from '@/features/settings';
import { formatDay, formatDuration, formatTime, t } from '@/shared/i18n';
import { type DateKey, fromDateKey, getMonthGrid, toDateKey } from '@/shared/lib/date';

import { summarizeCompletion } from '../../domain/completionSummary';
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
  return {
    key: completion.completedAt,
    time: formatTime(new Date(completion.completedAt)),
    courseName: t(`course.${completion.courseId}.name`),
    detail: summary.endedEarly
      ? t('records.entryPartial', { done: summary.completedSets, total: completion.setCount, duration })
      : t('records.entry', { sets: t('sets.count', { count: completion.setCount }), duration }),
    endedEarly: summary.endedEarly,
  };
}

export function useRecordsScreen() {
  const router = useRouter();
  const [today] = useState(() => new Date());
  const [completions, setCompletions] = useState<WorkoutCompletion[]>([]);
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [month, setMonth] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const leavingRef = useRef(false);
  const todayKey = toDateKey(today);
  const [selectedDate, setSelectedDate] = useState<DateKey>(todayKey);

  useFocusEffect(
    useCallback(() => {
      leavingRef.current = false;
      void listWorkoutCompletions().then(setCompletions);
      void getPreferences().then(setPreferences);
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

  const updatePreferences = (patch: Partial<Preferences>) => {
    const next = { ...preferences, ...patch };
    setPreferences(next);
    void savePreferences(next);
  };

  const goHome = async () => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    // 記録→ホームの遷移でも、条件を満たせば広告（確率・1日1回まで）
    await tryShowInterstitial('recordsTransition');
    router.back();
  };

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
    preferences,
    onPrevMonth: () => shiftMonth(-1),
    onNextMonth: () => shiftMonth(1),
    onToggleSound: (soundEnabled: boolean) => updatePreferences({ soundEnabled }),
    onToggleVibration: (vibrationEnabled: boolean) => updatePreferences({ vibrationEnabled }),
    onToggleBgm: (bgmEnabled: boolean) => updatePreferences({ bgmEnabled }),
    onBack: goHome,
  };
}

function formatDayLabel(date: DateKey): string {
  return formatDay(fromDateKey(date));
}
