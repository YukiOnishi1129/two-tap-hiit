import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import { Screen } from '@/shared/components/Screen';
import { Button } from '@/shared/components/ui/button';
import { Text } from '@/shared/components/ui/text';
import type { ExerciseId } from '@/shared/domain/workout';
import { t } from '@/shared/i18n';
import { cn } from '@/shared/lib/utils';

import { ExerciseVisual } from '../ExerciseVisual';
import type { WorkoutMode } from './useWorkoutScreen';

export type WorkoutScreenPresenterProps = {
  mode: WorkoutMode;
  title: string;
  visualExerciseId: ExerciseId;
  nextLabel: string | null;
  setLabel: string;
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
        <ExerciseVisual
          exerciseId={props.visualExerciseId}
          active={props.mode === 'exercise' && !props.isPaused}
          size={props.mode === 'exercise' ? 'lg' : 'sm'}
        />
        <Text className="text-center text-3xl font-extrabold text-white" accessibilityRole="header">
          {props.title}
        </Text>
        <Text
          className={cn('font-extrabold text-white', isFinalCountdown ? 'text-[150px]' : 'text-[120px]')}
          style={{ fontVariant: ['tabular-nums'], lineHeight: isFinalCountdown ? 160 : 130 }}
          accessibilityLiveRegion="polite">
          {props.remainingSec}
        </Text>
        {props.nextLabel && <Text className="text-xl font-semibold text-white/90">{props.nextLabel}</Text>}
        {props.isPaused && (
          <View className="rounded-full bg-black/30 px-4 py-1.5">
            <Text className="text-base font-bold text-white">{t('workout.paused')}</Text>
          </View>
        )}
      </View>

      <View className="flex-row gap-3 pb-6">
        <Button variant="ghost" size="lg" className="h-16 flex-1 border-2 border-white/60" onPress={props.onEnd}>
          <Text className="text-lg font-bold text-white">{t('workout.end')}</Text>
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
