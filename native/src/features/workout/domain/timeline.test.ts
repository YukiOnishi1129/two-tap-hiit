import { getWorkoutDurationSec, SET_COUNTS } from '@/shared/domain/workout';

import { buildTimeline, getTimelinePosition, READY_SECONDS } from './timeline';

describe('buildTimeline', () => {
  it('スタンダード2セットの流れ', () => {
    const phases = buildTimeline('standard', 2);
    expect(phases.map((p) => (p.kind === 'exercise' ? p.exerciseId : p.kind))).toEqual([
      'ready',
      'burpee',
      'rest',
      'mountainClimber',
      'rest',
      'burpee',
      'rest',
      'mountainClimber',
    ]);
  });

  it('静かめコースの種目', () => {
    const exercises = buildTimeline('quiet', 2).flatMap((p) => (p.kind === 'exercise' ? [p.exerciseId] : []));
    expect(new Set(exercises)).toEqual(new Set(['noJumpBurpee', 'squat']));
  });

  it.each(SET_COUNTS)('%iセット: 運動30秒と休憩15秒が交互に並ぶ', (setCount) => {
    for (const courseId of ['standard', 'quiet'] as const) {
      const [ready, ...phases] = buildTimeline(courseId, setCount);
      expect(ready?.kind).toBe('ready');
      expect(phases).toHaveLength(setCount * 4 - 1);
      phases.forEach((phase, i) => {
        expect(phase.kind).toBe(i % 2 === 0 ? 'exercise' : 'rest');
        expect(phase.durationSec).toBe(i % 2 === 0 ? 30 : 15);
      });
      const total = phases.reduce((sum, p) => sum + p.durationSec, 0);
      expect(total).toBe(getWorkoutDurationSec(setCount));
    }
  });

  it('休憩中は次の種目がわかる', () => {
    const phases = buildTimeline('standard', 2);
    expect(phases[2]).toMatchObject({ kind: 'rest', nextExerciseId: 'mountainClimber' });
    expect(phases[4]).toMatchObject({ kind: 'rest', nextExerciseId: 'burpee', setNumber: 1 });
  });
});

describe('getTimelinePosition', () => {
  const phases = buildTimeline('standard', 2);
  const readyMs = READY_SECONDS * 1000;

  it('開始直後はカウントダウン', () => {
    expect(getTimelinePosition(phases, 0)).toMatchObject({ phaseIndex: 0, remainingSec: 3 });
  });

  it('残り秒数は切り上げ', () => {
    expect(getTimelinePosition(phases, readyMs + 1)).toMatchObject({ phaseIndex: 1, remainingSec: 30 });
    expect(getTimelinePosition(phases, readyMs + 29_001)).toMatchObject({ phaseIndex: 1, remainingSec: 1 });
    expect(getTimelinePosition(phases, readyMs + 30_000)).toMatchObject({ phaseIndex: 2, remainingSec: 15 });
  });

  it('最後まで経過したら完了', () => {
    const totalMs = readyMs + getWorkoutDurationSec(2) * 1000;
    expect(getTimelinePosition(phases, totalMs - 1)).toMatchObject({ done: false, phaseIndex: phases.length - 1 });
    expect(getTimelinePosition(phases, totalMs)).toEqual({ done: true });
  });
});
