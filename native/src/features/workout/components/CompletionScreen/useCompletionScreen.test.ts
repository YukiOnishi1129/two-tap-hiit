import { act, renderHook } from '@testing-library/react-native';

import { tryShowInterstitial } from '@/features/ads';
import { addWorkoutCompletion } from '@/features/records';

import { useCompletionScreen } from './useCompletionScreen';

const mockDismissAll = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ dismissAll: mockDismissAll }) }));
jest.mock('@/features/ads', () => ({ tryShowInterstitial: jest.fn() }));
jest.mock('@/features/records', () => ({ addWorkoutCompletion: jest.fn(() => Promise.resolve()) }));
jest.mock('@/shared/config/getAppConfig', () => ({
  getAppConfig: () =>
    Promise.resolve({ ads: { recordsTransitionProbability: 0.25, completionInterstitialDelaySeconds: 5 } }),
}));

const showAd = jest.mocked(tryShowInterstitial);

const render = () => renderHook(() => useCompletionScreen({ courseId: 'quiet', setCount: 4 }));

/** マイクロタスク（Promise）とタイマーを進める */
async function advance(ms: number) {
  await act(async () => {
    await jest.advanceTimersByTimeAsync(ms);
  });
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
});

afterEach(() => {
  jest.useRealTimers();
});

it('完了時に記録を1回だけ保存する', async () => {
  showAd.mockResolvedValue('skipped');
  const { rerender } = await render();
  await rerender({});
  await advance(0);
  expect(addWorkoutCompletion).toHaveBeenCalledTimes(1);
  expect(addWorkoutCompletion).toHaveBeenCalledWith(
    expect.objectContaining({ courseId: 'quiet', setCount: 4, completedSets: 4, durationSec: 345 }),
  );
});

it('途中でやめた回は、できたセット数と動いた時間で記録する', async () => {
  showAd.mockResolvedValue('skipped');
  const { result } = await renderHook(() =>
    useCompletionScreen({ courseId: 'standard', setCount: 8, earlyEnd: { completedSets: 2, durationSec: 200 } }),
  );
  await advance(0);
  expect(addWorkoutCompletion).toHaveBeenCalledWith(
    expect.objectContaining({ courseId: 'standard', setCount: 8, completedSets: 2, durationSec: 200 }),
  );
  expect(result.current).toMatchObject({ endedEarly: true, completedSets: 2, totalSec: 200 });
});

it('5秒後に広告を出し、閉じたらホームへ戻る', async () => {
  showAd.mockResolvedValue('shown');
  await render();
  await advance(4999);
  expect(showAd).not.toHaveBeenCalled();
  await advance(1);
  expect(showAd).toHaveBeenCalledWith('completion');
  expect(mockDismissAll).toHaveBeenCalledTimes(1);
});

it('5秒後に広告を出せない条件なら、完了画面にとどまる', async () => {
  showAd.mockResolvedValue('skipped');
  await render();
  await advance(5000);
  expect(showAd).toHaveBeenCalledTimes(1);
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
  expect(mockDismissAll).toHaveBeenCalledTimes(1);
});

it('自動トリガーの後にホームを押しても広告は増えない', async () => {
  showAd.mockResolvedValue('skipped');
  const { result } = await render();
  await advance(5000);
  await act(() => result.current.onHome());
  expect(showAd).toHaveBeenCalledTimes(1);
  expect(mockDismissAll).toHaveBeenCalledTimes(1);
});

it('合計時間は最後の休憩を含まない', async () => {
  showAd.mockResolvedValue('skipped');
  const { result } = await render();
  // 4セット = 30秒×8 + 15秒×7
  expect(result.current.totalSec).toBe(345);
});
