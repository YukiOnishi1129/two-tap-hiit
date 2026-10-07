import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import { Screen } from '@/shared/components/Screen';
import { Button } from '@/shared/components/ui/button';
import { Text } from '@/shared/components/ui/text';
import { t } from '@/shared/i18n';
import { cn } from '@/shared/lib/utils';

import { ExerciseVisual, type Motion } from '../ExerciseVisual';
import type { NextExercise, WorkoutMode } from './useWorkoutScreen';

export type WorkoutScreenPresenterProps = {
  mode: WorkoutMode;
  title: string;
  /** 大きく動かすビジュアル（運動中は種目、休憩中・開始前は 'rest'） */
  mainMotion: Motion;
  /** 運動中の種目のやり方（一行）。休憩中・開始前は null */
  howTo: string | null;
  /** 休憩中・開始前に予告する、つぎの種目 */
  next: NextExercise | null;
  setLabel: string;
  /** 終了ボタンの文言（通常は「やめる」、フリーは「おわる」） */
  endLabel: string;
  remainingSec: number;
  progress: number;
  isPaused: boolean;
  onTogglePause: () => void;
  onEnd: () => void;
};

const MODE_BG: Record<WorkoutMode, string> = {
  ready: 'bg-mode-ready',
  exercise: 'bg-mode-exercise',
  rest: 'bg-mode-rest',
};

const MODE_LABEL_KEY = {
  ready: 'workout.getReady',
  exercise: 'workout.exercise',
  rest: 'workout.rest',
} as const;

/** 色（モード）・大きな数字・文字の3つで状態を伝える。音だけに頼らない。 */
export function WorkoutScreenPresenter(props: WorkoutScreenPresenterProps) {
  const isFinalCountdown = props.remainingSec <= 3 && props.remainingSec > 0;

  return (
    <Screen className={cn(MODE_BG[props.mode], 'px-6')}>
      <StatusBar style="light" />

      <View className="flex-row items-center justify-between pt-4">
        <Text className="text-lg font-bold text-white">{t(MODE_LABEL_KEY[props.mode])}</Text>
        <Text className="text-lg font-semibold text-white">{props.setLabel}</Text>
      </View>

      <View className="mt-3 h-2 overflow-hidden rounded-full bg-white/25">
        <View className="h-full rounded-full bg-white" style={{ width: `${Math.min(1, props.progress) * 100}%` }} />
      </View>

      <View className="flex-1 items-center justify-center gap-4">
        <ExerciseVisual motion={props.mainMotion} state={props.isPaused ? 'paused' : 'playing'} />
        <Text className="text-center text-3xl font-extrabold text-white" accessibilityRole="header">
          {props.title}
        </Text>
        <Text
          className={cn('font-extrabold text-white', isFinalCountdown ? 'text-[150px]' : 'text-[120px]')}
          style={{ fontVariant: ['tabular-nums'], lineHeight: isFinalCountdown ? 160 : 130 }}
          accessibilityLiveRegion="polite">
          {props.remainingSec}
        </Text>
        {props.howTo && (
          <Text className="text-center text-base font-medium leading-6 text-white/90">{props.howTo}</Text>
        )}
        {props.next && (
          <View className="w-full flex-row items-center gap-3 rounded-lg bg-white/15 p-3">
            <ExerciseVisual motion={props.next.exerciseId} state="preview" size="xs" />
            <View className="flex-1 gap-0.5">
              <Text className="text-lg font-bold text-white">{props.next.label}</Text>
              <Text className="text-sm leading-5 text-white/90">{props.next.howTo}</Text>
            </View>
          </View>
        )}
        {props.isPaused && (
          <View className="rounded-full bg-black/30 px-4 py-1.5">
            <Text className="text-base font-bold text-white">{t('workout.paused')}</Text>
          </View>
        )}
      </View>

      <View className="flex-row gap-3 pb-6">
        <Button variant="ghost" size="lg" className="h-16 flex-1 border-2 border-white/60" onPress={props.onEnd}>
          <Text className="text-lg font-bold text-white">{props.endLabel}</Text>
        </Button>
        <Button size="lg" className="h-16 flex-[2] bg-white active:bg-white/90" onPress={props.onTogglePause}>
          <Text className="text-lg font-bold text-foreground">
            {props.isPaused ? t('workout.resume') : t('workout.pause')}
          </Text>
        </Button>
      </View>
    </Screen>
  );
}
