// タイマー用の効果音 (WAV) を生成するスクリプト。
// 外部素材に頼らずシンプルなビープ音を用意するためのもの。
// 実行: node scripts/generate-sounds.mjs
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SAMPLE_RATE = 22050;
const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'sounds');

/** tones: [周波数Hz, 長さ秒] の配列。0Hz は無音。 */
function render(tones, volume = 0.5) {
  const samples = [];
  for (const [freq, seconds] of tones) {
    const count = Math.floor(SAMPLE_RATE * seconds);
    for (let i = 0; i < count; i++) {
      // 前後 10ms をフェードしてプチノイズを防ぐ
      const fade = Math.min(1, i / (SAMPLE_RATE * 0.01), (count - i) / (SAMPLE_RATE * 0.01));
      const value = freq === 0 ? 0 : Math.sin((2 * Math.PI * freq * i) / SAMPLE_RATE);
      samples.push(value * volume * fade);
    }
  }
  return samples;
}

function toWav(samples) {
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  samples.forEach((s, i) => buffer.writeInt16LE(Math.round(s * 32767), 44 + i * 2));
  return buffer;
}

// ---------------------------------------------------------------
// BGM: 128BPM・8小節のループ（キック + ハイハット + ベース + コード）。
// 自前で生成しているので権利の心配なし。もっと良い曲にしたくなったら
// assets/sounds/bgm.wav を差し替えればよい（ループ再生される）。
// ---------------------------------------------------------------
function renderBgm() {
  const bpm = 128;
  const beatSec = 60 / bpm;
  const bars = 8;
  const total = Math.round(SAMPLE_RATE * beatSec * 4 * bars);
  const out = new Float32Array(total);

  // 乱数は固定シードで（毎回同じ音になるように）
  let seed = 42;
  const random = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296) * 2 - 1;

  const add = (startSec, durationSec, fn) => {
    const start = Math.round(startSec * SAMPLE_RATE);
    const count = Math.round(durationSec * SAMPLE_RATE);
    for (let i = 0; i < count && start + i < total; i++) out[start + i] += fn(i / SAMPLE_RATE, i / count);
  };

  // コード進行（1小節ずつ）: Am - F - C - G
  const roots = [110, 87.31, 130.81, 98];
  const chords = [
    [220, 261.63, 329.63],
    [174.61, 220, 261.63],
    [261.63, 329.63, 392],
    [196, 246.94, 293.66],
  ];

  for (let bar = 0; bar < bars; bar++) {
    const barStart = bar * beatSec * 4;
    const root = roots[bar % 4];
    const chord = chords[bar % 4];

    for (let beat = 0; beat < 4; beat++) {
      const t0 = barStart + beat * beatSec;
      // キック: 高い音から低い音へ素早く下がるサイン波
      add(t0, 0.28, (t, p) => {
        const freq = 50 + 90 * Math.exp(-t * 30);
        return Math.sin(2 * Math.PI * freq * t) * Math.exp(-p * 5) * 0.9;
      });
      // ハイハット（裏拍）: 短いノイズ
      add(t0 + beatSec / 2, 0.05, (_, p) => random() * Math.exp(-p * 6) * 0.18);
    }

    // ベース: 8分音符でルート音（オクターブを行き来）
    for (let i = 0; i < 8; i++) {
      const freq = i % 2 === 0 ? root : root * 2;
      add(barStart + (i * beatSec) / 2, beatSec / 2 - 0.02, (t, p) => {
        const wave = Math.sign(Math.sin(2 * Math.PI * freq * t)) * 0.5 + Math.sin(2 * Math.PI * freq * t) * 0.5;
        return wave * Math.min(1, p * 40) * (1 - p) * 0.22;
      });
    }

    // コード: 2拍目と4拍目に短く鳴らす
    for (const beat of [1, 3]) {
      add(barStart + beat * beatSec, beatSec * 0.6, (t, p) => {
        const v = chord.reduce((sum, f) => sum + Math.sin(2 * Math.PI * f * t), 0) / chord.length;
        return v * Math.min(1, p * 30) * Math.exp(-p * 3) * 0.28;
      });
    }
  }

  // 音割れしないように正規化
  const peak = out.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
  return Array.from(out, (v) => (v / peak) * 0.8);
}

const sounds = {
  // ラスト3秒のカウントダウン「ピッ」
  tick: render([[1000, 0.09]], 0.6),
  // 運動開始「ピーッ」
  go: render([[1000, 0.55]], 0.6),
  // 休憩開始「ピッ・ポー」
  rest: render([[1000, 0.12], [0, 0.06], [660, 0.35]], 0.55),
  // 全セット完了
  finish: render([[784, 0.15], [988, 0.15], [1175, 0.15], [1568, 0.4]]),
  bgm: renderBgm(),
};

for (const [name, samples] of Object.entries(sounds)) {
  writeFileSync(join(outDir, `${name}.wav`), toWav(samples));
  console.log(`generated ${name}.wav`);
}
