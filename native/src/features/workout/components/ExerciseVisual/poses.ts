import type { ExerciseId } from '@/shared/domain/workout';

// 棒人間アニメーションの姿勢データ。
// 横から見た姿（右向き）で、関節の座標を viewBox (0 -50 200 210) 上に置く。地面は y = 150。
// 「N」は手前の手足、「F」は奥の手足（薄く描く）。
// キーフレームを順につないでループ再生する。最後のキーフレームは最初と同じ姿勢にしてつなぎ目をなくす。

export const GROUND_Y = 150;
export const VIEW_BOX = '0 -50 200 210';

export const JOINTS = [
  'head',
  'shoulder',
  'hip',
  'elbowN',
  'handN',
  'elbowF',
  'handF',
  'kneeN',
  'footN',
  'kneeF',
  'footF',
] as const;
export type Joint = (typeof JOINTS)[number];
export type Point = readonly [number, number];
export type Pose = Record<Joint, Point>;

/** 骨（線）の定義。奥の手足を先に描いて、手前の手足が上に重なるようにする。 */
export const BONES: readonly { from: Joint; to: Joint; far: boolean }[] = [
  { from: 'shoulder', to: 'elbowF', far: true },
  { from: 'elbowF', to: 'handF', far: true },
  { from: 'hip', to: 'kneeF', far: true },
  { from: 'kneeF', to: 'footF', far: true },
  { from: 'shoulder', to: 'hip', far: false },
  { from: 'hip', to: 'kneeN', far: false },
  { from: 'kneeN', to: 'footN', far: false },
  { from: 'shoulder', to: 'elbowN', far: false },
  { from: 'elbowN', to: 'handN', far: false },
];

// --- 基本の姿勢 ---

const STAND: Pose = {
  head: [100, 13],
  shoulder: [100, 30],
  hip: [100, 80],
  elbowN: [102, 57],
  handN: [104, 83],
  elbowF: [98, 57],
  handF: [96, 83],
  kneeN: [102, 115],
  footN: [104, 150],
  kneeF: [97, 115],
  footF: [96, 150],
};

/** 立った状態で腕を前に出す（スクワットのバランス用） */
const STAND_ARMS_FORWARD: Pose = {
  ...STAND,
  elbowN: [127, 32],
  handN: [153, 33],
  elbowF: [124, 34],
  handF: [150, 35],
};

/** 深くしゃがんで、手を床につく（バービー用） */
const CROUCH_HANDS_DOWN: Pose = {
  head: [133, 72],
  shoulder: [120, 84],
  hip: [86, 120],
  elbowN: [131, 109],
  handN: [138, 135],
  elbowF: [127, 110],
  handF: [133, 136],
  kneeN: [117, 112],
  footN: [107, 145],
  kneeF: [120, 118],
  footF: [101, 147],
};

/** 腕立て伏せの上の姿勢（プランク） */
const PLANK: Pose = {
  head: [155, 92],
  shoulder: [140, 100],
  hip: [91, 110],
  elbowN: [141, 125],
  handN: [142, 150],
  elbowF: [137, 125],
  handF: [137, 150],
  kneeN: [56, 125],
  footN: [22, 143],
  kneeF: [57, 128],
  footF: [24, 146],
};

/** 片足（手前）だけ後ろに下げた途中の姿勢（ジャンプなしバービー用） */
const ONE_LEG_BACK: Pose = {
  head: [150, 85],
  shoulder: [136, 95],
  hip: [92, 118],
  elbowN: [139, 120],
  handN: [141, 147],
  elbowF: [135, 121],
  handF: [136, 148],
  kneeN: [58, 130],
  footN: [24, 146],
  kneeF: [127, 122],
  footF: [104, 148],
};

/** ジャンプ（腕を上げて浮く） */
const JUMP: Pose = {
  head: [100, -7],
  shoulder: [100, 10],
  hip: [100, 60],
  elbowN: [106, -16],
  handN: [110, -42],
  elbowF: [94, -16],
  handF: [90, -42],
  kneeN: [102, 95],
  footN: [101, 130],
  kneeF: [97, 95],
  footF: [95, 129],
};

/** プランクから手前の膝を胸に引きつける（マウンテンクライマー用） */
const PLANK_NEAR_KNEE_IN: Pose = {
  ...PLANK,
  kneeN: [121, 124],
  footN: [100, 146],
};

/** プランクから奥の膝を胸に引きつける */
const PLANK_FAR_KNEE_IN: Pose = {
  ...PLANK,
  kneeF: [119, 126],
  footF: [98, 148],
};

/** スクワットの一番下（太ももが床と平行くらい、腕は前） */
const SQUAT_BOTTOM: Pose = {
  head: [109, 52],
  shoulder: [101, 67],
  hip: [80, 112],
  elbowN: [128, 66],
  handN: [154, 64],
  elbowF: [125, 68],
  handF: [151, 66],
  kneeN: [112, 118],
  footN: [104, 150],
  kneeF: [114, 119],
  footF: [98, 150],
};

/** 腰に手を当てて立つ（休憩中） */
const REST_EXHALE: Pose = {
  ...STAND,
  elbowN: [118, 49],
  handN: [104, 72],
  elbowF: [82, 49],
  handF: [96, 72],
};

/** 息を吸って、肩と頭が少し上がる */
const REST_INHALE: Pose = {
  ...REST_EXHALE,
  head: [100, 10],
  shoulder: [100, 27],
  elbowN: [119, 46],
  handN: [104, 70],
  elbowF: [81, 46],
  handF: [96, 70],
};

export type ExerciseAnimation = {
  /** キーフレーム1区間あたりのミリ秒 */
  segmentMs: number;
  keyframes: readonly Pose[];
  /** 止めた絵（つぎの種目のプレビュー）で見せるキーフレーム。その種目らしさが一番出る姿勢 */
  previewFrame: number;
};

export const EXERCISE_ANIMATIONS: Record<ExerciseId, ExerciseAnimation> = {
  // 立つ → しゃがんで手をつく → 両足を後ろへ → 戻す → 立つ → ジャンプ
  burpee: {
    segmentMs: 420,
    keyframes: [STAND, CROUCH_HANDS_DOWN, PLANK, PLANK, CROUCH_HANDS_DOWN, STAND, JUMP, STAND],
    previewFrame: 2,
  },
  // 立つ → しゃがんで手をつく → 片足ずつ後ろへ → 片足ずつ戻す → 立つ（ジャンプしない）
  noJumpBurpee: {
    segmentMs: 520,
    keyframes: [STAND, CROUCH_HANDS_DOWN, ONE_LEG_BACK, PLANK, ONE_LEG_BACK, CROUCH_HANDS_DOWN, STAND, STAND],
    previewFrame: 2,
  },
  // プランクのまま、膝を左右交互に胸へ
  mountainClimber: {
    segmentMs: 230,
    keyframes: [PLANK, PLANK_NEAR_KNEE_IN, PLANK, PLANK_FAR_KNEE_IN, PLANK],
    previewFrame: 1,
  },
  // 腕を前に出しながらしゃがむ → 立つ
  squat: {
    segmentMs: 750,
    keyframes: [STAND, STAND_ARMS_FORWARD, SQUAT_BOTTOM, STAND_ARMS_FORWARD, STAND],
    previewFrame: 2,
  },
};

/** 休憩中・開始前: 腰に手を当てて、ゆっくり呼吸 */
export const REST_ANIMATION: ExerciseAnimation = {
  segmentMs: 1300,
  keyframes: [REST_EXHALE, REST_INHALE, REST_EXHALE],
  previewFrame: 0,
};

/** ビジュアルで表示できる動き（各種目 + 休憩） */
export type Motion = ExerciseId | 'rest';

export function getAnimation(motion: Motion): ExerciseAnimation {
  return motion === 'rest' ? REST_ANIMATION : EXERCISE_ANIMATIONS[motion];
}

/** ワークレット（UI スレッド）で扱いやすいよう、各キーフレームを数値配列 [x0, y0, x1, y1, ...] にする */
export function toFrames(animation: ExerciseAnimation): number[][] {
  return animation.keyframes.map((pose) => JOINTS.flatMap((joint) => [...pose[joint]]));
}
