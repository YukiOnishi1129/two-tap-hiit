import type { CourseId, SetCount } from '@/shared/domain/workout';

import { CompletionScreenPresenter } from './CompletionScreenPresenter';
import { useCompletionScreen } from './useCompletionScreen';

export function CompletionScreenContainer(props: { courseId: CourseId; setCount: SetCount }) {
  return <CompletionScreenPresenter {...useCompletionScreen(props)} />;
}
