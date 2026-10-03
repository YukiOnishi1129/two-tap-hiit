import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';

import { type InterstitialResult, tryShowInterstitial } from '@/features/ads';
import { addWorkoutCompletion } from '@/features/records';
import { getAppConfig } from '@/shared/config/getAppConfig';
import { type CourseId, type EarlyEnd, getWorkoutDurationSec, type SetCount } from '@/shared/domain/workout';
import { toDateKey } from '@/shared/lib/date';

/**
 * 完了画面の流れ:
 *
 *   完了画面を表示（記録を保存）
 *   → 5秒待つ → 広告を出せる条件なら表示 → 閉じたらホームへ
 *                 出せない条件なら完了画面にとどまる（ユーザーが「ホームへ」を押すまで）
 *
 *   5秒以内に「ホームへ」→ 広告を出せる条件なら表示 → 閉じたらホームへ
 *
 * どの経路でも、1回の完了で広告は最大1回だけ。
 * 途中でやめた回（earlyEnd あり）も、ここまでの分を記録して同じ流れにする。
 */
export function useCompletionScreen({
  courseId,
  setCount,
  earlyEnd = null,
}: {
  courseId: CourseId;
  setCount: SetCount;
  earlyEnd?: EarlyEnd | null;
}) {
  const completedSets = earlyEnd?.completedSets ?? setCount;
  const durationSec = earlyEnd?.durationSec ?? getWorkoutDurationSec(setCount);
  const router = useRouter();
  const adRef = useRef<Promise<InterstitialResult> | null>(null);
  const leavingRef = useRef(false);

  // 広告の表示は1回だけ。2回目以降の呼び出しは同じ Promise を返す
  const triggerAd = useCallback(() => {
    adRef.current ??= tryShowInterstitial('completion');
    return adRef.current;
  }, []);

  const goHome = useCallback(() => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    router.dismissAll();
  }, [router]);

  // 記録の保存（1回だけ）
  const savedRef = useRef(false);
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    const now = new Date();
    void addWorkoutCompletion({
      date: toDateKey(now),
      courseId,
      setCount,
      completedAt: now.toISOString(),
      completedSets,
      durationSec,
    });
  }, [courseId, setCount, completedSets, durationSec]);

  // 5秒後の自動トリガー
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    void getAppConfig().then((config) => {
      if (cancelled) return;
      timer = setTimeout(async () => {
        const result = await triggerAd();
        if (result === 'shown') goHome();
      }, config.ads.completionInterstitialDelaySeconds * 1000);
    });
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [triggerAd, goHome]);

  const onHome = async () => {
    await triggerAd();
    goHome();
  };

  return { courseId, setCount, completedSets, totalSec: durationSec, endedEarly: earlyEnd !== null, onHome };
}
