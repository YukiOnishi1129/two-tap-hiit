import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';

import { tryShowInterstitial } from '@/features/ads';
import { DEFAULT_PREFERENCES, getPreferences, type Preferences, savePreferences } from '@/features/settings';
import { getMonthGrid, toDateKey } from '@/shared/lib/date';

import { countMonthDays, countStreak, countWeekDays, getCompletedDates } from '../../domain/recordStats';
import { listWorkoutCompletions } from '../../repository/workoutCompletionRepository';
import type { WorkoutCompletion } from '../../types/workoutCompletion';

export function useRecordsScreen() {
  const router = useRouter();
  const [today] = useState(() => new Date());
  const [completions, setCompletions] = useState<WorkoutCompletion[]>([]);
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [month, setMonth] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const leavingRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      leavingRef.current = false;
      void listWorkoutCompletions().then(setCompletions);
      void getPreferences().then(setPreferences);
    }, []),
  );

  const completedDates = useMemo(() => getCompletedDates(completions), [completions]);
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
    todayKey: toDateKey(today),
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
    onBack: goHome,
  };
}
