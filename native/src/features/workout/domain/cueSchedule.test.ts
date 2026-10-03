import { type CueMarker, decideCue, type TimerCue } from './cueSchedule';
import { buildTimeline, getTimelinePosition } from './timeline';

/** タイマーと同じく 100ms ごとに位置を調べて、鳴った合図を「何秒目に何が鳴ったか」で集める */
function simulate(): { atSec: number; cue: TimerCue }[] {
  const phases = buildTimeline('quiet', 2);
  const events: { atSec: number; cue: TimerCue }[] = [];
  let marker: CueMarker = null;
  for (let ms = 0; ; ms += 100) {
    const position = getTimelinePosition(phases, ms);
    if (position.done) break;
    const cue = decideCue(marker, position);
    if (cue) events.push({ atSec: ms / 1000, cue });
    marker = { phaseIndex: position.phaseIndex, remainingSec: position.remainingSec };
  }
  return events;
}

const events = simulate();
const at = (sec: number) => events.filter((e) => Math.abs(e.atSec - sec) < 0.15).map((e) => e.cue);

describe('合図のタイミング', () => {
  it('開始前カウントダウンは 3・2・1 で毎秒ピッ', () => {
    expect(at(0)).toEqual(['tick']);
    expect(at(1.1)).toEqual(['tick']);
    expect(at(2.1)).toEqual(['tick']);
  });

  it('運動開始でピーッ', () => {
    expect(at(3)).toEqual(['go']);
  });

  it('運動の終わり3秒前から毎秒ピッ（30秒の運動なら残り3・2・1）', () => {
    // 運動は 3〜33秒。残り3秒 = 30.1秒あたり
    expect(at(30.1)).toEqual(['tick']);
    expect(at(31.1)).toEqual(['tick']);
    expect(at(32.1)).toEqual(['tick']);
    expect(at(33)).toEqual(['rest']);
  });

  it('休憩の終わり3秒前も同じく毎秒ピッ → 運動開始でピーッ', () => {
    // 休憩は 33〜48秒
    expect(at(45.1)).toEqual(['tick']);
    expect(at(46.1)).toEqual(['tick']);
    expect(at(47.1)).toEqual(['tick']);
    expect(at(48)).toEqual(['go']);
  });

  it('それ以外の時間は鳴らない（ピッは各フェーズ3回ずつ）', () => {
    const phases = buildTimeline('quiet', 2);
    const ticks = events.filter((e) => e.cue === 'tick');
    expect(ticks).toHaveLength(phases.length * 3);
    expect(events.filter((e) => e.cue === 'go')).toHaveLength(4);
    expect(events.filter((e) => e.cue === 'rest')).toHaveLength(3);
  });
});
