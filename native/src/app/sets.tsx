import { Redirect, useLocalSearchParams } from 'expo-router';

import { SetSelectScreen } from '@/features/workout';
import { isCourseId } from '@/shared/domain/workout';

export default function SetsRoute() {
  const { course } = useLocalSearchParams<{ course?: string }>();
  if (!isCourseId(course)) return <Redirect href="/" />;
  return <SetSelectScreen courseId={course} />;
}
