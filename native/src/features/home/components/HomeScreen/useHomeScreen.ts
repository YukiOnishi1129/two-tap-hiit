import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { tryShowInterstitial } from '@/features/ads';
import { getCompletedDates, getWeekDays, listWorkoutCompletions, type WeekDay } from '@/features/records';

export function useHomeScreen() {
  const router = useRouter();
  const [weekDays, setWeekDays] = useState<WeekDay[]>(() => getWeekDays(new Set(), new Date()));
  const navigatingRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      navigatingRef.current = false;
      void listWorkoutCompletions().then((completions) =>
        setWeekDays(getWeekDays(getCompletedDates(completions), new Date())),
      );
    }, []),
  );

  const onStart = () => {
    // スタート導線には広告を挟まない
    router.push('/course');
  };

  const onOpenRecords = async () => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    await tryShowInterstitial('recordsTransition');
    router.push('/records');
  };

  return { weekDays, onStart, onOpenRecords };
}
