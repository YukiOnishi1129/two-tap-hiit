import { useRouter } from 'expo-router';

import type { CourseId } from '@/shared/domain/workout';

export function useCourseSelectScreen() {
  const router = useRouter();
  // コース選択 → セット選択の間に広告は挟まない
  const onSelect = (courseId: CourseId) => router.push({ pathname: '/sets', params: { course: courseId } });
  return { onSelect };
}
