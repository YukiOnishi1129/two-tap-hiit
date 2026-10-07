import { act, renderHook } from '@testing-library/react-native';

import { tryShowInterstitial } from '@/features/ads';
import { saveWorkoutResult, type WorkoutCompletion, type WorkoutResult } from '@/features/records';

import { type CompletionParams, useCompletionScreen } from './useCompletionScreen';

const mockDismissAll = jest.fn();
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ dismissAll: mockDismissAll, replace: mockReplace }) }));
jest.mock('@/features/ads', () => ({ tryShowInterstitial: jest.fn() }));
jest.mock('@/features/records', () => ({
  ...jest.requireActual('@/features/records/domain/completionSummary'),
  saveWorkoutResult: jest.fn(),
}));
jest.mock('@/shared/config/getAppConfig', () => ({
  getAppConfig: () =>
    Promise.resolve({ ads: { recordsTransitionProbability: 0.25, completionInterstitialDelaySeconds: 5 } }),
}));

const showAd = jest.mocked(tryShowInterstitial);
const save = jest.mocked(saveWorkoutResult);

/** 保存処理のモック: 受け取った結果をそのまま記録にして返す（もう1セットなら既存の4セットに足す） */
function mockSave(result: WorkoutResult): Promise<WorkoutCompletion> {
  const base = result.extendsId ? { setCount: 4, completedSets: 4, durationSec: 345 } : null;
  return Promise.resolve({
    id: result.extendsId ?? 'rec-1',
    date: '2026-10-07',
    courseId: result.courseId,
    mode: result.mode,
    setCount: (base?.setCount ?? 0) + (result.mode === 'free' ? result.completedSets : result.plannedSets),
    completedAt: '2026-10-07T08:00:00.000Z',
    completedSets: (base?.completedSets ?? 0) + result.completedSets,
    durationSec: (base?.durationSec ?? 0) + result.durationSec,
  });
}

const fullQuiet4: CompletionParams = { courseId: 'quiet', sets: 4, extendsId: null, outcome: null };
const render = (params: CompletionParams = fullQuiet4) => renderHook(() => useCompletionScreen(params));

/** マイクロタスク（Promise）とタイマーを進める */
async function advance(ms: number) {
  await act(async () => {
    await jest.advanceTimersByTimeAsync(ms);
  });
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  save.mockImplementation(mockSave);
  showAd.mockResolvedValue('skipped');
});

afterEach(() => {
  jest.useRealTimers();
});

describe('記録の保存', () => {
  it('最後までやった回を1回だけ保存する', async () => {
    const { rerender } = await render();
    await rerender({});
    await advance(0);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith({
      courseId: 'quiet',
      mode: 'sets',
      plannedSets: 4,
      completedSets: 4,
      durationSec: 345,
      extendsId: null,
    });
  });

  it('途中でやめた回は、できたセット数と動いた時間で保存する', async () => {
    const { result } = await render({
      courseId: 'standard',
      sets: 8,
      extendsId: null,
      outcome: { completedSets: 2, durationSec: 200 },
    });
    await advance(0);
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ plannedSets: 8, completedSets: 2, durationSec: 200 }));
    expect(result.current).toMatchObject({ endedEarly: true, completedSets: 2, setCount: 8, totalSec: 200 });
  });

  it('フリーは終えたセット数で保存し、「途中まで」にはしない', async () => {
    const { result } = await render({
      courseId: 'standard',
      sets: 'free',
      extendsId: null,
      outcome: { completedSets: 3, durationSec: 250 },
    });
    await advance(0);
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ mode: 'free', plannedSets: 0, completedSets: 3 }));
    expect(result.current).toMatchObject({ mode: 'free', completedSets: 3, endedEarly: false });
  });

  it('もう1セットの回は、足し算した合計を表示する（4セット + 1 = 5セット）', async () => {
    const { result } = await render({ courseId: 'quiet', sets: 1, extendsId: 'rec-1', outcome: null });
    await advance(0);
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ plannedSets: 1, completedSets: 1, extendsId: 'rec-1' }));
    expect(result.current).toMatchObject({ setCount: 5, completedSets: 5, totalSec: 420, endedEarly: false });
  });
});

describe('広告', () => {
  it('5秒後に広告を出し、閉じても完了画面に残る（自動でホームへ行かない）', async () => {
    showAd.mockResolvedValue('shown');
    await render();
    await advance(4999);
    expect(showAd).not.toHaveBeenCalled();
    await advance(1);
    expect(showAd).toHaveBeenCalledWith('completion', expect.anything());
    await advance(10_000);
    expect(mockDismissAll).not.toHaveBeenCalled();
  });

  it('5秒以内にホームを押したら、その場で広告 → ホーム。広告は1回だけ', async () => {
    showAd.mockResolvedValue('shown');
    const { result } = await render();
    await advance(1000);
    await act(() => result.current.onHome());
    expect(showAd).toHaveBeenCalledTimes(1);
    expect(mockDismissAll).toHaveBeenCalledTimes(1);

    await advance(10_000);
    expect(showAd).toHaveBeenCalledTimes(1);
  });

  it('自動の広告のあとにホームを押しても、広告は増えずにホームへ', async () => {
    showAd.mockResolvedValue('shown');
    const { result } = await render();
    await advance(5000);
    await act(() => result.current.onHome());
    expect(showAd).toHaveBeenCalledTimes(1);
    expect(mockDismissAll).toHaveBeenCalledTimes(1);
  });
});

describe('もう1セット', () => {
  it('広告を出さずに、保存した記録に足し算する形で1セット始める', async () => {
    const { result } = await render();
    await advance(1000);
    await act(() => result.current.onOneMore());
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/workout',
      params: { course: 'quiet', sets: '1', extend: 'rec-1' },
    });
    // 5秒後の自動広告も出ない
    await advance(10_000);
    expect(showAd).not.toHaveBeenCalled();
    expect(mockDismissAll).not.toHaveBeenCalled();
  });

  it('広告の判定中に押されたら、広告は出さない', async () => {
    const { result } = await render();
    await advance(5000);
    const options = showAd.mock.calls[0]?.[1];
    expect(options?.isStillWanted?.()).toBe(true);
    await act(() => result.current.onOneMore());
    expect(options?.isStillWanted?.()).toBe(false);
  });

  it('連打しても1回だけ始める', async () => {
    const { result } = await render();
    await advance(0);
    await act(async () => {
      await Promise.all([result.current.onOneMore(), result.current.onOneMore(), result.current.onHome()]);
    });
    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockDismissAll).not.toHaveBeenCalled();
  });
});
