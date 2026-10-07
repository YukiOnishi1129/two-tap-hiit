import type { WorkoutCompletion, WorkoutResult } from '../types/workoutCompletion';
import { summarizeCompletion } from './completionSummary';
import { mergeWorkoutResult } from './mergeWorkoutResult';

const now = new Date(2026, 9, 7, 8, 0);

const result = (overrides: Partial<WorkoutResult> = {}): WorkoutResult => ({
  courseId: 'standard',
  mode: 'sets',
  plannedSets: 4,
  completedSets: 4,
  durationSec: 345,
  extendsId: null,
  ...overrides,
});

describe('mergeWorkoutResult', () => {
  it('通常は新しい記録として追加する', () => {
    const { completions, saved } = mergeWorkoutResult([], result(), now, 'id-1');
    expect(completions).toHaveLength(1);
    expect(saved).toMatchObject({ id: 'id-1', date: '2026-10-07', setCount: 4, completedSets: 4, durationSec: 345 });
  });

  it('もう1セットは同じ記録に足し算する（4セット → 5セット）', () => {
    const first = mergeWorkoutResult([], result(), now, 'id-1');
    const later = new Date(2026, 9, 7, 8, 3);
    const { completions, saved } = mergeWorkoutResult(
      first.completions,
      result({ plannedSets: 1, completedSets: 1, durationSec: 75, extendsId: 'id-1' }),
      later,
      'id-2',
    );
    expect(completions).toHaveLength(1);
    expect(saved).toMatchObject({ id: 'id-1', setCount: 5, completedSets: 5, durationSec: 420 });
    expect(saved.completedAt).toBe(later.toISOString());
    expect(summarizeCompletion(saved).endedEarly).toBe(false);
  });

  it('もう1セットを途中でやめたら「途中まで」になる', () => {
    const first = mergeWorkoutResult([], result(), now, 'id-1');
    const { saved } = mergeWorkoutResult(
      first.completions,
      result({ plannedSets: 1, completedSets: 0, durationSec: 40, extendsId: 'id-1' }),
      now,
      'id-2',
    );
    expect(summarizeCompletion(saved)).toMatchObject({ setCount: 5, completedSets: 4, endedEarly: true });
  });

  it('フリーは終えたセット数で記録し、「途中まで」にはしない', () => {
    const { saved } = mergeWorkoutResult(
      [],
      result({ mode: 'free', plannedSets: 0, completedSets: 3, durationSec: 250 }),
      now,
      'id-1',
    );
    expect(summarizeCompletion(saved)).toMatchObject({ mode: 'free', setCount: 3, completedSets: 3, endedEarly: false });
  });

  it('フリーのあとのもう1セットも足し算する', () => {
    const first = mergeWorkoutResult([], result({ mode: 'free', plannedSets: 0, completedSets: 3, durationSec: 250 }), now, 'id-1');
    const { saved } = mergeWorkoutResult(
      first.completions,
      result({ plannedSets: 1, completedSets: 1, durationSec: 75, extendsId: 'id-1' }),
      now,
      'id-2',
    );
    expect(summarizeCompletion(saved)).toMatchObject({ mode: 'free', setCount: 4, completedSets: 4, durationSec: 325 });
  });

  it('古いデータ（id なし）にも completedAt で足し算できる', () => {
    const old: WorkoutCompletion = {
      date: '2026-10-01',
      courseId: 'quiet',
      setCount: 2,
      completedAt: '2026-10-01T07:00:00.000Z',
    };
    const { completions, saved } = mergeWorkoutResult(
      [old],
      result({ courseId: 'quiet', plannedSets: 1, completedSets: 1, durationSec: 75, extendsId: old.completedAt }),
      now,
      'id-2',
    );
    expect(completions).toHaveLength(1);
    expect(saved).toMatchObject({ id: old.completedAt, date: '2026-10-01', setCount: 3, completedSets: 3, durationSec: 240 });
  });

  it('足し算する先が見つからなければ新しい記録にする', () => {
    const { completions } = mergeWorkoutResult([], result({ extendsId: 'missing' }), now, 'id-1');
    expect(completions).toHaveLength(1);
  });
});
