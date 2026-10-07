import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { type InterstitialResult, tryShowInterstitial } from '@/features/ads';
import {
  type CompletionSummary,
  completionId,
  saveWorkoutResult,
  summarizeCompletion,
  type WorkoutCompletion,
} from '@/features/records';
import { getAppConfig } from '@/shared/config/getAppConfig';
import {
  FREE_MAX_SETS,
  getWorkoutDurationSec,
  type WorkoutOutcome,
  type WorkoutParams,
} from '@/shared/domain/workout';

export type CompletionParams = WorkoutParams & {
  /** 途中でやめた・フリーで「おわる」を押したときの実際の内容。予定どおり最後までやった場合は null */
  outcome: WorkoutOutcome | null;
};

/**
 * 完了画面の流れ:
 *
 *   完了画面を表示（記録を保存。「もう1セット」なら同じ記録に足し算）
 *   → 5秒待つ → 広告を出せる条件なら表示 → 閉じたら完了画面に戻る（自動でホームには行かない）
 *
 *   「ホームへ」→ まだ広告を出していなければ、出せる条件なら表示 → 閉じたらホームへ
 *   「もう1セット」→ 広告は出さずに、同じコースで1セット追加して始める
 *
 * どの経路でも、1回の完了画面で広告は最大1回だけ。
 */
export function useCompletionScreen({ courseId, sets, extendsId, outcome }: CompletionParams) {
  const router = useRouter();
  const isFree = sets === 'free';
  const plannedSets = isFree ? 0 : sets;
  // フリーで上限まで行った場合だけ outcome が無い
  const completedSets = outcome?.completedSets ?? (isFree ? FREE_MAX_SETS : plannedSets);
  const durationSec = outcome?.durationSec ?? getWorkoutDurationSec(completedSets);

  // --- 記録の保存（1回だけ） ---
  const [saved, setSaved] = useState<WorkoutCompletion | null>(null);
  const savingRef = useRef<Promise<WorkoutCompletion | null> | null>(null);
  useEffect(() => {
    if (savingRef.current) return;
    savingRef.current = saveWorkoutResult({
      courseId,
      mode: isFree ? 'free' : 'sets',
      plannedSets,
      completedSets,
      durationSec,
      extendsId,
    })
      .then((record) => {
        setSaved(record);
        return record;
      })
      .catch(() => null);
  }, [courseId, isFree, plannedSets, completedSets, durationSec, extendsId]);

  // 表示は保存した記録（「もう1セット」なら足し算した合計）。保存が終わるまでは今回の分
  const summary: CompletionSummary = saved
    ? summarizeCompletion(saved)
    : {
        mode: isFree ? 'free' : 'sets',
        setCount: isFree ? completedSets : plannedSets,
        completedSets,
        durationSec,
        endedEarly: !isFree && completedSets < plannedSets,
      };

  // --- 広告 ---
  const adRef = useRef<Promise<InterstitialResult> | null>(null);
  const leavingRef = useRef(false);
  const startingOneMoreRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // 広告の表示は1回だけ。2回目以降の呼び出しは同じ Promise を返す
  const triggerAd = useCallback(() => {
    adRef.current ??= tryShowInterstitial('completion', {
      // 判定中に「もう1セット」が押されたら出さない（スタート導線に広告を挟まない）
      isStillWanted: () => !startingOneMoreRef.current,
    });
    return adRef.current;
  }, []);

  // 5秒後の自動トリガー。広告を閉じたあとは完了画面に残る
  useEffect(() => {
    let cancelled = false;
    void getAppConfig().then((config) => {
      if (cancelled || leavingRef.current) return;
      timerRef.current = setTimeout(() => {
        if (!leavingRef.current) void triggerAd();
      }, config.ads.completionInterstitialDelaySeconds * 1000);
    });
    return () => {
      cancelled = true;
      clearTimeout(timerRef.current);
    };
  }, [triggerAd]);

  const onHome = async () => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    clearTimeout(timerRef.current);
    await triggerAd();
    router.dismissAll();
  };

  const onOneMore = async () => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    startingOneMoreRef.current = true;
    clearTimeout(timerRef.current);
    // 保存が終わってから、その記録に足し算する形で1セット始める
    const record = await savingRef.current;
    router.replace({
      pathname: '/workout',
      params: { course: courseId, sets: '1', ...(record ? { extend: completionId(record) } : {}) },
    });
  };

  return {
    courseId,
    mode: summary.mode,
    setCount: summary.setCount,
    completedSets: summary.completedSets,
    totalSec: summary.durationSec,
    endedEarly: summary.endedEarly,
    onHome,
    onOneMore,
  };
}
