import { type AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';

export type Cue = 'tick' | 'go' | 'rest' | 'finish';

const SOURCES: Record<Cue, number> = {
  tick: require('../../../../assets/sounds/tick.wav'),
  go: require('../../../../assets/sounds/go.wav'),
  rest: require('../../../../assets/sounds/rest.wav'),
  finish: require('../../../../assets/sounds/finish.wav'),
};

let players: Record<Cue, AudioPlayer> | null = null;

/** 音の再生モード。BGM と効果音を重ねて鳴らし、他アプリの音は少し下げる。 */
export function ensureAudioMode(): void {
  void setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'duckOthers' }).catch(() => {});
}

function getPlayers(): Record<Cue, AudioPlayer> {
  if (!players) {
    ensureAudioMode();
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
    // 巻き戻しが終わってから再生する（終わる前に play すると鳴らないことがある）
    player
      .seekTo(0)
      .then(() => player.play())
      .catch(() => player.play());
  } catch {
    // 音はあくまで補助なので失敗しても無視する
  }
}

/** 画面を開いた時点で読み込んでおき、最初の「ピッ」が遅れないようにする */
export function preloadSounds(): void {
  try {
    getPlayers();
  } catch {
    // 無視
  }
}
