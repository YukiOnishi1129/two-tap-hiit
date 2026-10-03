import type { CourseId } from '@/shared/domain/workout';

import { SetSelectScreenPresenter } from './SetSelectScreenPresenter';
import { useSetSelectScreen } from './useSetSelectScreen';

export function SetSelectScreenContainer(props: { courseId: CourseId }) {
  return <SetSelectScreenPresenter {...useSetSelectScreen(props)} />;
}
