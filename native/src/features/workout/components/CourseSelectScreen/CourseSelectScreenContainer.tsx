import { CourseSelectScreenPresenter } from './CourseSelectScreenPresenter';
import { useCourseSelectScreen } from './useCourseSelectScreen';

export function CourseSelectScreenContainer() {
  return <CourseSelectScreenPresenter {...useCourseSelectScreen()} />;
}
