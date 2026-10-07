import { Redirect, useLocalSearchParams } from 'expo-router';

import { CompletionScreen } from '@/features/workout';
import { parseWorkoutOutcome, parseWorkoutParams, plannedSetCount } from '@/shared/domain/workout';

export default function CompleteRoute() {
  const { course, sets, extend, doneSets, sec } = useLocalSearchParams<{
    course?: string;
    /** 1〜8 または free */
    sets?: string;
    /** 「もう1セット」のとき、足し算する先の記録の ID */
    extend?: string;
    /** 途中でやめた・フリーで終えたときだけ: できたセット数 */
    doneSets?: string;
    /** 途中でやめた・フリーで終えたときだけ: 動いた秒数 */
    sec?: string;
  }>();
  const params = parseWorkoutParams(course, sets, extend);
  if (!params) return <Redirect href="/" />;
  const outcome = parseWorkoutOutcome(doneSets, sec, plannedSetCount(params.sets));
  return <CompletionScreen {...params} outcome={outcome} />;
}
