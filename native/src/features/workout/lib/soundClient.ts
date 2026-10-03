import { type AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';

export type Cue = 'tick' | 'go' | 'rest' | 'finish';

const SOURCES: Record<Cue, number> = {
  tick: require('../../../../assets/sounds/tick.wav'),
  go: require('../../../../assets/sounds/go.wav'),
  rest: require('../../../../assets/sounds/rest.wav'),
  finish: require('../../../../assets/sounds/finish.wav'),
};

let players: Record<Cue, AudioPlayer> | null = null;

function getPlayers(): Record<Cue, AudioPlayer> {
  if (!players) {
    // 音楽を聴きながら使えるように、他アプリの音は止めずに少し下げる
    void setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'duckOthers' }).catch(() => {});
    players = {
      tick: createAudioPlayer(SOURCES.tick),
      go: createAudioPlayer(SOURCES.go),
      rest: createAudioPlayer(SOURCES.rest),
      finish: createAudioPlayer(SOURCES.finish),
    };
  }
  return players;
}

/** 効果音を鳴らす。音が出せない環境でも例外は投げない。 */
export function playSound(cue: Cue): void {
  try {
    const player = getPlayers()[cue];
    void player.seekTo(0);
    player.play();
  } catch {
    // 音はあくまで補助なので失敗しても無視する
  }
}
