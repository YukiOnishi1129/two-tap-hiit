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

const sounds = {
  // ラスト3秒のカウントダウン
  tick: render([[880, 0.12]]),
  // 運動開始
  go: render([[1320, 0.35]]),
  // 休憩開始
  rest: render([[660, 0.18], [0, 0.06], [520, 0.25]]),
  // 全セット完了
  finish: render([[784, 0.15], [988, 0.15], [1175, 0.15], [1568, 0.4]]),
};

for (const [name, samples] of Object.entries(sounds)) {
  writeFileSync(join(outDir, `${name}.wav`), toWav(samples));
  console.log(`generated ${name}.wav`);
}
