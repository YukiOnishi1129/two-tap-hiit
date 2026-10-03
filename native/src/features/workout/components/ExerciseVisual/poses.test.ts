import { BONES, EXERCISE_ANIMATIONS, GROUND_Y, type Pose, REST_ANIMATION } from './poses';

const length = (pose: Pose, from: keyof Pose, to: keyof Pose) => {
  const [x1, y1] = pose[from];
  const [x2, y2] = pose[to];
  return Math.hypot(x2 - x1, y2 - y1);
};

// 基準の骨の長さ（立ち姿勢）
const reference = EXERCISE_ANIMATIONS.squat.keyframes[0]!;

describe.each([...Object.entries(EXERCISE_ANIMATIONS), ['rest', REST_ANIMATION] as const])('%s', (_, animation) => {
  it('最後のキーフレームが最初と同じ（ループのつなぎ目がない）', () => {
    expect(animation.keyframes.at(-1)).toEqual(animation.keyframes[0]);
  });

  it('どの姿勢でも骨の長さがほぼ同じ（手足が伸び縮みしない）', () => {
    for (const pose of animation.keyframes) {
      for (const { from, to } of BONES) {
        const expected = length(reference, from, to);
        const actual = length(pose, from, to);
        expect(Math.abs(actual - expected) / expected).toBeLessThan(0.15);
      }
    }
  });

  it('プレビュー用の姿勢がキーフレームの範囲内', () => {
    expect(animation.keyframes[animation.previewFrame]).toBeDefined();
  });

  it('足と手が地面より下にいかない', () => {
    for (const pose of animation.keyframes) {
      for (const joint of ['footN', 'footF', 'handN', 'handF'] as const) {
        expect(pose[joint][1]).toBeLessThanOrEqual(GROUND_Y);
      }
    }
  });
});
