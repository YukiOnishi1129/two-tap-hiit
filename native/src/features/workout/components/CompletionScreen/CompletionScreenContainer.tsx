import type { CourseId, EarlyEnd, SetCount } from '@/shared/domain/workout';

import { CompletionScreenPresenter } from './CompletionScreenPresenter';
import { useCompletionScreen } from './useCompletionScreen';

export function CompletionScreenContainer(props: { courseId: CourseId; setCount: SetCount; earlyEnd?: EarlyEnd | null }) {
  return <CompletionScreenPresenter {...useCompletionScreen(props)} />;
}
