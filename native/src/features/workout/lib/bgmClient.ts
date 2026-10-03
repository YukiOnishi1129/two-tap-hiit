import { type AudioPlayer, createAudioPlayer } from 'expo-audio';

import { ensureAudioMode } from './soundClient';

// ワークアウト中の BGM。assets/sounds/bgm.wav をループ再生する。

let player: AudioPlayer | null = null;

function getPlayer(): AudioPlayer {
  if (!player) {
    ensureAudioMode();
    player = createAudioPlayer(require('../../../../assets/sounds/bgm.wav'));
    player.loop = true;
  }
  return player;
}

/** 指定した音量で再生（すでに再生中なら音量だけ変える）。 */
export function playBgm(volume: number): void {
  try {
    const p = getPlayer();
    p.volume = volume;
    if (!p.playing) p.play();
  } catch {
    // BGM が鳴らなくてもワークアウトは続けられる
  }
}

export function pauseBgm(): void {
  try {
    player?.pause();
  } catch {
    // 無視
  }
}

/** 止めて最初に戻す（ワークアウト終了時）。 */
export function stopBgm(): void {
  try {
    if (!player) return;
    player.pause();
    void player.seekTo(0).catch(() => {});
  } catch {
    // 無視
  }
}
