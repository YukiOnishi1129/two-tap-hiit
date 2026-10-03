import { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import {
  cancelAnimation,
  createAnimatedComponent,
  Easing,
  type SharedValue,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Line } from 'react-native-svg';

import { cn } from '@/shared/lib/utils';

import { BONES, getAnimation, GROUND_Y, type Joint, JOINTS, type Motion, toFrames, VIEW_BOX } from './poses';

// 運動のビジュアル。棒人間で「どう動くか」をループ再生する。
// 目的は「正しいフォームの指導」ではなく「いま何をすればいいか一目でわかること」。
// 本番素材 (Lottie / Rive / 動画ループ) に差し替えるときは、このコンポーネントの中身を
// 置き換えれば、呼び出し側（props）は変更不要。

const AnimatedLine = createAnimatedComponent(Line);
const AnimatedCircle = createAnimatedComponent(Circle);

const STROKE = '#FFFFFF';
const HEAD_RADIUS = 11;

/**
 * - playing: ループ再生
 * - paused: いまの姿勢のまま止める（一時停止中）
 * - preview: その種目らしい姿勢で止めて見せる（「つぎ」の種目の絵）
 */
export type VisualState = 'playing' | 'paused' | 'preview';

type Props = {
  /** 種目、または 'rest'（休憩中の呼吸） */
  motion: Motion;
  state: VisualState;
  size?: 'lg' | 'xs';
};

export function ExerciseVisual({ motion, state, size = 'lg' }: Props) {
  return (
    <View className={cn('items-center justify-center', size === 'lg' ? 'h-52 w-60' : 'h-16 w-20')}>
      {/* 動きが変わったら作り直して、アニメーションを最初から再生する */}
      <StickFigure key={motion} motion={motion} state={state} />
    </View>
  );
}

function StickFigure({ motion, state }: { motion: Motion; state: VisualState }) {
  const animation = getAnimation(motion);
  const frames = useMemo(() => toFrames(animation), [animation]);
  const progress = useSharedValue(state === 'preview' ? animation.previewFrame : 0);

  useEffect(() => {
    if (state === 'preview') {
      cancelAnimation(progress);
      progress.set(animation.previewFrame);
      return;
    }
    if (state === 'paused') {
      cancelAnimation(progress);
      return;
    }
    const segments = frames.length - 1;
    const loopMs = segments * animation.segmentMs;
    const remainingMs = (1 - (progress.get() % segments) / segments) * loopMs;
    // 止めた位置から再開して、最後まで行ったら最初からループ
    progress.set(
      withTiming(segments, { duration: remainingMs, easing: Easing.linear }, (finished) => {
        if (!finished) return;
        progress.set(0);
        progress.set(withRepeat(withTiming(segments, { duration: loopMs, easing: Easing.linear }), -1));
      }),
    );
    return () => cancelAnimation(progress);
  }, [state, animation.segmentMs, animation.previewFrame, frames.length, progress]);

  return (
    <Svg width="100%" height="100%" viewBox={VIEW_BOX}>
      <Line x1={10} y1={GROUND_Y + 4} x2={190} y2={GROUND_Y + 4} stroke={STROKE} strokeOpacity={0.35} strokeWidth={3} strokeLinecap="round" />
      {BONES.map(({ from, to, far }) => (
        <Bone key={`${from}-${to}`} progress={progress} frames={frames} from={from} to={to} far={far} />
      ))}
      <Head progress={progress} frames={frames} />
    </Svg>
  );
}

const jointIndex = (joint: Joint) => JOINTS.indexOf(joint) * 2;

/** progress（キーフレーム番号 + 区間内の割合）から座標を求める。区間ごとにイーズをかける。 */
function sample(frames: number[][], progress: number, index: number): number {
  'worklet';
  const last = frames.length - 1;
  const segment = Math.min(Math.max(Math.floor(progress), 0), last - 1);
  const t = Math.min(Math.max(progress - segment, 0), 1);
  const eased = t * t * (3 - 2 * t);
  const from = frames[segment]?.[index] ?? 0;
  const to = frames[segment + 1]?.[index] ?? from;
  return from + (to - from) * eased;
}

type BoneProps = {
  progress: SharedValue<number>;
  frames: number[][];
  from: Joint;
  to: Joint;
  far: boolean;
};

function Bone({ progress, frames, from, to, far }: BoneProps) {
  const a = jointIndex(from);
  const b = jointIndex(to);
  const animatedProps = useAnimatedProps(() => ({
    x1: sample(frames, progress.get(), a),
    y1: sample(frames, progress.get(), a + 1),
    x2: sample(frames, progress.get(), b),
    y2: sample(frames, progress.get(), b + 1),
  }));
  return (
    <AnimatedLine
      animatedProps={animatedProps}
      stroke={STROKE}
      strokeOpacity={far ? 0.45 : 1}
      strokeWidth={9}
      strokeLinecap="round"
    />
  );
}

function Head({ progress, frames }: { progress: SharedValue<number>; frames: number[][] }) {
  const i = jointIndex('head');
  const animatedProps = useAnimatedProps(() => ({
    cx: sample(frames, progress.get(), i),
    cy: sample(frames, progress.get(), i + 1),
  }));
  return <AnimatedCircle animatedProps={animatedProps} r={HEAD_RADIUS} fill={STROKE} />;
}
