// 英語の文言。トーン: 率直・フレンドリー・押しつけない・アスリートっぽくしすぎない。
// キーの定義元なので、新しい文言はまずここに追加し、ja.ts にも同じキーを追加する。
export const en = {
  'app.name': '2-Tap HIIT',
  'app.tagline': 'Pick a course. Pick sets. Move.',

  'home.start': 'Start',
  'home.thisWeek': 'This week',
  'home.records': 'Records',

  'course.title': 'Choose a course',
  'course.standard.name': 'Standard',
  'course.standard.description': 'The classic. Gets your heart going.',
  'course.quiet.name': 'Quiet',
  'course.quiet.description': 'No jumping. Apartment-friendly.',

  'exercise.burpee': 'Burpee',
  'exercise.mountainClimber': 'Mountain climber',
  'exercise.noJumpBurpee': 'No-jump burpee',
  'exercise.squat': 'Squat',
  'exercise.burpee.howTo': 'Squat, hands down → jump feet back → jump in → jump up',
  'exercise.mountainClimber.howTo': 'Push-up position. Drive knees to chest, left and right',
  'exercise.noJumpBurpee.howTo': 'Squat, hands down → step back one leg at a time → step in → stand',
  'exercise.squat.howTo': 'Feet shoulder-width. Sit back like into a chair, then stand',

  'sets.title': 'How many sets?',
  'sets.count': '{count} sets',
  'sets.duration': 'About {minutes} min',
  'sets.note': '1 set = 2 moves, 30 sec each',

  'workout.getReady': 'Get ready',
  'workout.exercise': 'Move',
  'workout.rest': 'Rest',
  'workout.next': 'Next: {name}',
  'workout.setProgress': 'Set {current} / {total}',
  'workout.pause': 'Pause',
  'workout.resume': 'Resume',
  'workout.end': 'End',
  'workout.paused': 'Paused',
  'workout.endConfirm.title': 'End this workout?',
  'workout.endConfirm.message': "This round won't be saved.",
  'workout.endConfirm.cancel': 'Keep going',
  'workout.endConfirm.confirm': 'End',

  'complete.title': 'Done!',
  'complete.message': 'Nice. You moved today.',
  'complete.course': 'Course',
  'complete.sets': 'Sets',
  'complete.time': 'Time',
  'complete.home': 'Home',

  'records.title': 'Records',
  'records.thisWeek': 'This week',
  'records.thisMonth': 'This month',
  'records.streak': 'Streak',
  'records.days': '{count} d',
  'records.prevMonth': 'Previous month',
  'records.nextMonth': 'Next month',
  'records.weekdays': 'M,T,W,T,F,S,S',
  'records.empty': 'Nothing yet. One round is plenty.',

  'settings.title': 'Settings',
  'settings.sound': 'Sound',
  'settings.vibration': 'Vibration',
  'settings.bgm': 'Music',

  'time.minSec': '{m} min {s} sec',
  'time.min': '{m} min',

  'ad.banner': 'Ad space',
  'ad.mockInterstitial': 'Ad (mock)',
  'ad.close': 'Close',

  'common.back': 'Back',
} as const;

export type MessageKey = keyof typeof en;
