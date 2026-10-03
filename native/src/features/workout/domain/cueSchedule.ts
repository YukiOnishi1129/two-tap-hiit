import type { TimelinePosition } from './timeline';

export type TimerCue = 'go' | 'rest' | 'tick';

/** 合図を出すかどうか判定するために覚えておく「直前に見た位置」 */
export type CueMarker = { phaseIndex: number; remainingSec: number } | null;

export const COUNTDOWN_SECONDS = 3;

/**
 * 表示中の位置が変わったときに鳴らす合図を決める。
 *
 * - 運動フェーズに入った瞬間 → go（ピーッ）
 * - 休憩フェーズに入った瞬間 → rest（ピッ・ポー）
 * - どのフェーズでも終わる3秒前から1秒ごと → tick（ピッ）
 *   （開始前カウントダウン・運動の終わり・休憩の終わり、すべて同じ）
 */
export function decideCue(previous: CueMarker, current: TimelinePosition): TimerCue | null {
  if (current.done) return null;
  if (previous && previous.phaseIndex === current.phaseIndex && previous.remainingSec === current.remainingSec) {
    return null;
  }
  const phaseStarted = previous?.phaseIndex !== current.phaseIndex;
  if (phaseStarted && current.phase.kind === 'exercise') return 'go';
  if (phaseStarted && current.phase.kind === 'rest') return 'rest';
  if (current.remainingSec <= COUNTDOWN_SECONDS) return 'tick';
  return null;
}
