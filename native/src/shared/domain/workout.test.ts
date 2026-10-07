import { FREE_MAX_SETS, parseSetChoice, parseWorkoutOutcome, parseWorkoutParams, plannedSetCount } from './workout';

describe('parseSetChoice', () => {
  it('1・2・4・6・8 とフリーを受け付ける', () => {
    expect(parseSetChoice('1')).toBe(1);
    expect(parseSetChoice('8')).toBe(8);
    expect(parseSetChoice('free')).toBe('free');
    expect(parseSetChoice('3')).toBeNull();
    expect(parseSetChoice(undefined)).toBeNull();
  });

  it('フリーは上限までタイマーを組む', () => {
    expect(plannedSetCount('free')).toBe(FREE_MAX_SETS);
    expect(plannedSetCount(4)).toBe(4);
  });
});

describe('parseWorkoutParams', () => {
  it('もう1セットの追加先 ID を取り出す', () => {
    expect(parseWorkoutParams('quiet', '1', 'abc')).toEqual({ courseId: 'quiet', sets: 1, extendsId: 'abc' });
    expect(parseWorkoutParams('standard', 'free')).toEqual({ courseId: 'standard', sets: 'free', extendsId: null });
    expect(parseWorkoutParams('unknown', '4')).toBeNull();
  });
});

describe('parseWorkoutOutcome', () => {
  it('パラメータが無ければ予定どおり最後までやった扱い', () => {
    expect(parseWorkoutOutcome(undefined, undefined, 4)).toBeNull();
  });

  it('範囲外の値は丸める', () => {
    expect(parseWorkoutOutcome('9', '99999', 4)).toEqual({ completedSets: 4, durationSec: 345 });
    expect(parseWorkoutOutcome('-1', '-5', 4)).toEqual({ completedSets: 0, durationSec: 0 });
  });
});
