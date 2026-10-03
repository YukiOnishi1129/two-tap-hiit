import type { MessageKey } from './en';

// 日本語の文言。トーン: シンプル・カジュアル・意識高すぎない・「めんどくさくない」。
export const ja: Record<MessageKey, string> = {
  'app.name': '2-Tap HIIT',
  'app.tagline': '迷わない30秒運動',

  'home.start': 'はじめる',
  'home.thisWeek': '今週',
  'home.records': '記録',

  'course.title': 'コースをえらぶ',
  'course.standard.name': 'スタンダード',
  'course.standard.description': 'しっかり動く定番コース',
  'course.quiet.name': '静かめ',
  'course.quiet.description': 'ジャンプなし。マンションでも安心',

  'exercise.burpee': 'バービージャンプ',
  'exercise.mountainClimber': 'マウンテンクライマー',
  'exercise.noJumpBurpee': 'ジャンプなしバービー',
  'exercise.squat': 'スクワット',

  'sets.title': '何セットやる？',
  'sets.count': '{count}セット',
  'sets.duration': '約{minutes}分',
  'sets.note': '1セット = 30秒×2種目',

  'workout.getReady': 'まもなく開始',
  'workout.exercise': '運動',
  'workout.rest': '休憩',
  'workout.next': 'つぎ：{name}',
  'workout.setProgress': 'セット {current} / {total}',
  'workout.pause': '一時停止',
  'workout.resume': '再開',
  'workout.end': 'やめる',
  'workout.paused': '一時停止中',
  'workout.endConfirm.title': 'ここでやめる？',
  'workout.endConfirm.message': 'この回は記録されません。',
  'workout.endConfirm.cancel': 'つづける',
  'workout.endConfirm.confirm': 'やめる',

  'complete.title': 'おつかれ！',
  'complete.message': '今日も動けたね。',
  'complete.course': 'コース',
  'complete.sets': 'セット数',
  'complete.time': '時間',
  'complete.home': 'ホームへ',

  'records.title': '記録',
  'records.thisWeek': '今週',
  'records.thisMonth': '今月',
  'records.streak': '連続',
  'records.days': '{count}日',
  'records.prevMonth': '前の月',
  'records.nextMonth': '次の月',
  'records.weekdays': '月,火,水,木,金,土,日',
  'records.empty': 'まだ記録なし。1回やれば十分。',

  'settings.title': '設定',
  'settings.sound': 'サウンド',
  'settings.vibration': 'バイブ',

  'time.minSec': '{m}分{s}秒',
  'time.min': '{m}分',

  'ad.banner': '広告枠',
  'ad.mockInterstitial': '広告（ダミー）',
  'ad.close': '閉じる',

  'common.back': '戻る',
};
