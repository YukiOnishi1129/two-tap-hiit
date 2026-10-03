import * as Haptics from 'expo-haptics';

import type { Cue } from './soundClient';

/** 振動させる。非対応端末では何もしない。 */
export function vibrate(cue: Cue): void {
  const run = (): Promise<void> => {
    switch (cue) {
      case 'tick':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      case 'go':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      case 'rest':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      case 'finish':
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };
  void run().catch(() => {});
}
