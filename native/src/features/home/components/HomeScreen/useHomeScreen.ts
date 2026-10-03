import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { getCompletedDates, getWeekDays, listWorkoutCompletions, type WeekDay } from '@/features/records';

export function useHomeScreen() {
  const router = useRouter();
  const [weekDays, setWeekDays] = useState<WeekDay[]>(() => getWeekDays(new Set(), new Date()));

  useFocusEffect(
    useCallback(() => {
      void listWorkoutCompletions().then((completions) =>
        setWeekDays(getWeekDays(getCompletedDates(completions), new Date())),
      );
    }, []),
  );

  const onStart = () => {
    // スタート導線には広告を挟まない
    router.push('/course');
  };

  return { weekDays, onStart };
}
