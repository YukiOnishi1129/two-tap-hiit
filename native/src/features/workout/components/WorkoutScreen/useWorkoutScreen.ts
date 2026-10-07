import { useKeepAwake } from 'expo-keep-awake';
import { useRouter } from 'expo-router';
import { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';
import { Alert, BackHandler } from 'react-native';

import { DEFAULT_PREFERENCES, getPreferences, type Preferences } from '@/features/settings';
import { type ExerciseId, plannedSetCount, type WorkoutParams } from '@/shared/domain/workout';
import { formatSetCount, t } from '@/shared/i18n';

import { type CueMarker, decideCue } from '../../domain/cueSchedule';
import { buildTimeline, getTimelinePosition, getWorkoutProgress } from '../../domain/timeline';
import { pauseBgm, playBgm, stopBgm } from '../../lib/bgmClient';
import { playCue } from '../../lib/cues';
import { preloadSounds } from '../../lib/soundClient';
import { exerciseHowTo, exerciseName } from '../../lib/labels';

export type WorkoutMode = 'ready' | 'exercise' | 'rest';

type Clock = {
  /** 一時停止までに経過したミリ秒の合計 */
  accumulatedMs: number;
  /** 動いている間は再開した時刻、一時停止中は null */
  runningSince: number | null;
};

const TICK_MS = 100;
const BGM_VOLUME = { exercise: 0.5, rest: 0.2 } as const;

export type NextExercise = { exerciseId: ExerciseId; label: string; howTo: string };

function toNextExercise(exerciseId: ExerciseId): NextExercise {
  return { exerciseId, label: t('workout.next', { name: exerciseName(exerciseId) }), howTo: exerciseHowTo(exerciseId) };
}

export function useWorkoutScreen({ courseId, sets, extendsId }: WorkoutParams) {
  useKeepAwake();
  const router = useRouter();
  const isFree = sets === 'free';
  const setCount = plannedSetCount(sets);
  const phases = useMemo(() => buildTimeline(courseId, setCount), [courseId, setCount]);

  /** 完了画面へ渡すパラメータ。outcome は途中で終えたとき（フリーで「おわる」を含む）だけ渡す */
  const completeParams = (outcome?: { completedSets: number; activeSec: number }) => ({
    course: courseId,
    sets: String(sets),
    ...(extendsId ? { extend: extendsId } : {}),
    ...(outcome ? { doneSets: String(outcome.completedSets), sec: String(outcome.activeSec) } : {}),
  });

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
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  useEffect(() => {
    preloadSounds();
    void getPreferences().then(setPreferences);
  }, []);

  // 運動・休憩とも、終わる3秒前から1秒ごとに「ピッ」。切り替わった瞬間に「ピーッ」（運動開始）／「ピッ・ポー」（休憩開始）

  const cueMarkerRef = useRef<CueMarker>(null);
  const cueKey = position.done ? 'done' : `${position.phaseIndex}:${position.remainingSec}`;
  const onPositionChange = useEffectEvent((key: string) => {
    if (key === 'done' || position.done) return;
    const cue = decideCue(cueMarkerRef.current, position);
    cueMarkerRef.current = { phaseIndex: position.phaseIndex, remainingSec: position.remainingSec };
    if (cue) playCue(cue, preferences);
  });
  // 位置（フェーズと残り秒数）が変わったときだけ判定する
  useEffect(() => onPositionChange(cueKey), [cueKey]);

  // --- BGM: 運動中は普通の音量、休憩中は小さめ、開始前・一時停止中・完了後は止める ---
  const phaseKind = position.done ? null : position.phase.kind;
  const bgmVolume =
    !preferences.bgmEnabled || isPaused || phaseKind === null || phaseKind === 'ready'
      ? 0
      : phaseKind === 'exercise'
        ? BGM_VOLUME.exercise
        : BGM_VOLUME.rest;
  useEffect(() => {
    if (bgmVolume === 0) pauseBgm();
    else playBgm(bgmVolume);
  }, [bgmVolume]);
  useEffect(() => () => stopBgm(), []);

  // --- 完了 ---
  const finishedRef = useRef(false);
  const onFinished = useEffectEvent(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    playCue('finish', preferences);
    router.replace({ pathname: '/complete', params: completeParams() });
  });
  useEffect(() => {
    if (position.done) onFinished();
  }, [position.done]);

  // --- 途中でやめる / フリーで「おわる」（確認あり） ---
  const requestEnd = () => {
    const wasRunning = !isPaused;
    pause();
    const stoppedElapsedMs =
      clock.accumulatedMs + (clock.runningSince === null ? 0 : Math.max(0, Date.now() - clock.runningSince));
    const progress = getWorkoutProgress(phases, stoppedElapsedMs);
    const resumeIfNeeded = () => {
      if (wasRunning) resume();
    };
    const message = !progress.recordable
      ? t('workout.endConfirm.messageNotSaved')
      : isFree && progress.completedSets > 0
        ? t('workout.finishConfirm.message', { sets: formatSetCount(progress.completedSets) })
        : t('workout.endConfirm.messageSaved');
    Alert.alert(
      isFree ? t('workout.finishConfirm.title') : t('workout.endConfirm.title'),
      message,
      [
        { text: t('workout.endConfirm.cancel'), style: 'cancel', onPress: resumeIfNeeded },
        {
          text: isFree ? t('workout.finish') : t('workout.endConfirm.confirm'),
          // フリーで終えるのは普通の終わり方なので、赤い「破壊的」ボタンにしない
          style: isFree ? 'default' : 'destructive',
          onPress: () => {
            finishedRef.current = true;
            if (!progress.recordable) {
              router.dismissAll();
              return;
            }
            // ここまでの分を記録して完了画面へ
            router.replace({ pathname: '/complete', params: completeParams(progress) });
          },
        },
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
  const currentSet = phase.kind === 'ready' ? 1 : phase.setNumber;
  const title =
    phase.kind === 'exercise'
      ? exerciseName(phase.exerciseId)
      : phase.kind === 'rest'
        ? t('workout.rest')
        : t('workout.getReady');

  return {
    mode,
    title,
    // 運動中はその種目、休憩中・開始前は「休んでいる」動き
    mainMotion: phase.kind === 'exercise' ? phase.exerciseId : ('rest' as const),
    howTo: phase.kind === 'exercise' ? exerciseHowTo(phase.exerciseId) : null,
    // 休憩中・開始前は、つぎの種目を「止めた絵 + 名前 + やり方」で予告する
    next: phase.kind === 'exercise' ? null : toNextExercise(phase.nextExerciseId),
    setLabel: extendsId
      ? t('workout.oneMoreSet')
      : isFree
        ? t('workout.setProgressFree', { current: currentSet })
        : t('workout.setProgress', { current: currentSet, total: setCount }),
    endLabel: isFree ? t('workout.finish') : t('workout.end'),
    remainingSec: view.remainingSec,
    progress: view.progress,
    isPaused,
    onTogglePause: () => (isPaused ? resume() : pause()),
    onEnd: requestEnd,
  };
}
