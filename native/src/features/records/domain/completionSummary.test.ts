import type { WorkoutCompletion } from '../types/workoutCompletion';
import { summarizeCompletion } from './completionSummary';

const base: WorkoutCompletion = {
  date: '2026-10-04',
  courseId: 'standard',
  setCount: 4,
  completedAt: '2026-10-04T07:30:00.000Z',
};

describe('summarizeCompletion', () => {
  it('古いデータ（項目なし）は最後までやった扱い', () => {
    expect(summarizeCompletion(base)).toMatchObject({ mode: 'sets', setCount: 4, completedSets: 4, durationSec: 345, endedEarly: false });
  });

  it('最後までやった回', () => {
    expect(summarizeCompletion({ ...base, completedSets: 4, durationSec: 345 }).endedEarly).toBe(false);
  });

  it('途中でやめた回', () => {
    expect(summarizeCompletion({ ...base, completedSets: 2, durationSec: 200 })).toMatchObject({
      completedSets: 2,
      durationSec: 200,
      endedEarly: true,
    });
  });
});
