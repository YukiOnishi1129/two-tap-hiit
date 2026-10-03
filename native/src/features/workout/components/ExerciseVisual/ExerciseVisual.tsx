import { useEffect, useState } from 'react';
import { Animated, Easing, View } from 'react-native';

import type { ExerciseId } from '@/shared/domain/workout';
import { cn } from '@/shared/lib/utils';

// 運動のビジュアル。いまは絵文字 + 簡単な動きのプレースホルダー。
// 目的は「正しいフォームの指導」ではなく「いま何の種目か一目でわかること」。
// 本番素材 (Lottie / Rive / 動画ループ) に差し替えるときは、VISUALS の中身を
// 種目ごとのコンポーネントに置き換えれば、呼び出し側は変更不要。

type Motion = 'bounce' | 'shuffle' | 'dip';

const VISUALS: Record<ExerciseId, { icon: string; motion: Motion }> = {
  burpee: { icon: '🤸', motion: 'bounce' },
  mountainClimber: { icon: '🧗', motion: 'shuffle' },
  noJumpBurpee: { icon: '🙇', motion: 'dip' },
  squat: { icon: '🦵', motion: 'dip' },
};

type Props = {
  exerciseId: ExerciseId;
  /** false のときは止めて薄く表示（休憩中に次の種目を見せる用途など） */
  active: boolean;
  size?: 'lg' | 'sm';
};

export function ExerciseVisual({ exerciseId, active, size = 'lg' }: Props) {
  const { icon, motion } = VISUALS[exerciseId];
  const [value] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!active) {
      value.stopAnimation();
      value.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(value, { toValue: 1, duration: 450, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(value, { toValue: 0, duration: 450, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [active, value]);

  const transform =
    motion === 'bounce'
      ? [{ translateY: value.interpolate({ inputRange: [0, 1], outputRange: [0, -24] }) }]
      : motion === 'shuffle'
        ? [{ translateX: value.interpolate({ inputRange: [0, 1], outputRange: [-14, 14] }) }]
        : [{ scaleY: value.interpolate({ inputRange: [0, 1], outputRange: [1, 0.8] }) }];

  return (
    <View
      className={cn(
        'items-center justify-center rounded-full bg-white/15',
        size === 'lg' ? 'size-44' : 'size-24',
        !active && 'opacity-60',
      )}>
      <Animated.Text style={{ fontSize: size === 'lg' ? 88 : 44, transform }}>{icon}</Animated.Text>
    </View>
  );
}
