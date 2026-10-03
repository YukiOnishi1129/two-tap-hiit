import { Redirect, useLocalSearchParams } from 'expo-router';

import { CompletionScreen } from '@/features/workout';
import { parseEarlyEnd, parseWorkoutParams } from '@/shared/domain/workout';

export default function CompleteRoute() {
  const { course, sets, doneSets, sec } = useLocalSearchParams<{
    course?: string;
    sets?: string;
    /** 途中でやめたときだけ: できたセット数 */
    doneSets?: string;
    /** 途中でやめたときだけ: 動いた秒数 */
    sec?: string;
  }>();
  const params = parseWorkoutParams(course, sets);
  if (!params) return <Redirect href="/" />;
  return <CompletionScreen {...params} earlyEnd={parseEarlyEnd(doneSets, sec, params.setCount)} />;
}
