import { useKeepAwake } from 'expo-keep-awake';
import { useRouter } from 'expo-router';
import { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';
import { Alert, BackHandler } from 'react-native';

import { DEFAULT_PREFERENCES, getPreferences, type Preferences } from '@/features/settings';
import type { CourseId, ExerciseId, SetCount } from '@/shared/domain/workout';
import { t } from '@/shared/i18n';

import { buildTimeline, getTimelinePosition } from '../../domain/timeline';
import { playCue } from '../../lib/cues';
import { exerciseName } from '../../lib/labels';

export type WorkoutMode = 'ready' | 'exercise' | 'rest';

type Clock = {
  /** 一時停止までに経過したミリ秒の合計 */
  accumulatedMs: number;
  /** 動いている間は再開した時刻、一時停止中は null */
  runningSince: number | null;
};

const TICK_MS = 100;

export function useWorkoutScreen({ courseId, setCount }: { courseId: CourseId; setCount: SetCount }) {
  useKeepAwake();
  const router = useRouter();
  const phases = useMemo(() => buildTimeline(courseId, setCount), [courseId, setCount]);

  // 時刻ベースで経過時間を計算する（setInterval の誤差やバックグラウンドでずれないように）
  const [clock, setClock] = useState<Clock>(() => ({ accumulatedMs: 0, runningSince: Date.now() }));
  const [now, setNow] = useState(() => Date.now());
  const isPaused = clock.runningSince === null;

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, [isPaused]);

  const elapsedMs = clock.accumulatedMs + (clock.runningSince === null ? 0 : Math.max(0, now - clock.runningSince));
  const position = getTimelinePosition(phases, elapsedMs);

  const pause = () =>
    setClock((c) =>
      c.runningSince === null ? c : { accumulatedMs: c.accumulatedMs + Date.now() - c.runningSince, runningSince: null },
    );
  const resume = () => setClock((c) => (c.runningSince === null ? { ...c, runningSince: Date.now() } : c));

  // --- 音・振動の合図 ---
  const preferencesRef = useRef<Preferences>(DEFAULT_PREFERENCES);
  useEffect(() => {
    void getPreferences().then((p) => {
      preferencesRef.current = p;
    });
  }, []);

  const cueKey = position.done ? 'done' : `${position.phaseIndex}:${position.remainingSec}`;
  const lastCueKeyRef = useRef('');
  useEffect(() => {
    if (position.done || lastCueKeyRef.current === cueKey) return;
    const phaseStarted = !lastCueKeyRef.current.startsWith(`${position.phaseIndex}:`);
    lastCueKeyRef.current = cueKey;

    if (phaseStarted && position.phase.kind === 'exercise') playCue('go', preferencesRef.current);
    else if (phaseStarted && position.phase.kind === 'rest') playCue('rest', preferencesRef.current);
    else if (position.remainingSec <= 3) playCue('tick', preferencesRef.current); // ラスト3秒
  }, [cueKey, position]);

  // --- 完了 ---
  const finishedRef = useRef(false);
  useEffect(() => {
    if (!position.done || finishedRef.current) return;
    finishedRef.current = true;
    playCue('finish', preferencesRef.current);
    router.replace({ pathname: '/complete', params: { course: courseId, sets: String(setCount) } });
  }, [position.done, router, courseId, setCount]);

  // --- 途中でやめる（確認あり） ---
  const requestEnd = () => {
    const wasRunning = !isPaused;
    pause();
    const resumeIfNeeded = () => {
      if (wasRunning) resume();
    };
    Alert.alert(
      t('workout.endConfirm.title'),
      t('workout.endConfirm.message'),
      [
        { text: t('workout.endConfirm.cancel'), style: 'cancel', onPress: resumeIfNeeded },
        { text: t('workout.endConfirm.confirm'), style: 'destructive', onPress: () => router.dismissAll() },
      ],
      { cancelable: true, onDismiss: resumeIfNeeded },
    );
  };

  // Android の戻るボタンでも確認を出す
  const onHardwareBack = useEffectEvent(() => {
    requestEnd();
    return true;
  });
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
    return () => sub.remove();
  }, []);

  // --- 表示用に整形 ---
  const lastPhase = phases[phases.length - 1];
  const view = position.done
    ? { phase: lastPhase!, remainingSec: 0, progress: 1 }
    : { phase: position.phase, remainingSec: position.remainingSec, progress: position.progress };
  const { phase } = view;

  const mode: WorkoutMode = phase.kind;
  const visualExerciseId: ExerciseId = phase.kind === 'exercise' ? phase.exerciseId : phase.nextExerciseId;
  const title =
    phase.kind === 'exercise'
      ? exerciseName(phase.exerciseId)
      : phase.kind === 'rest'
        ? t('workout.rest')
        : t('workout.getReady');

  return {
    mode,
    title,
    visualExerciseId,
    nextLabel: phase.kind === 'exercise' ? null : t('workout.next', { name: exerciseName(phase.nextExerciseId) }),
    setLabel: t('workout.setProgress', { current: phase.kind === 'ready' ? 1 : phase.setNumber, total: setCount }),
    remainingSec: view.remainingSec,
    progress: view.progress,
    isPaused,
    onTogglePause: () => (isPaused ? resume() : pause()),
    onEnd: requestEnd,
  };
}
