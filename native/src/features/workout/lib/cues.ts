import type { Preferences } from '@/features/settings';

import { vibrate } from './hapticsClient';
import { type Cue, playSound } from './soundClient';

export type { Cue };

/**
 * 音と振動の合図を出す。音だけに頼らないよう、画面表示（色・数字）でも必ず状態を伝えること。
 */
export function playCue(cue: Cue, preferences: Preferences): void {
  if (preferences.soundEnabled) playSound(cue);
  if (preferences.vibrationEnabled) vibrate(cue);
}
