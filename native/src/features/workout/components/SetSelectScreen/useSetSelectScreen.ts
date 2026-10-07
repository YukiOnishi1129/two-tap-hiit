import { useRouter } from 'expo-router';

import type { CourseId, SetChoice } from '@/shared/domain/workout';

export function useSetSelectScreen({ courseId }: { courseId: CourseId }) {
  const router = useRouter();
  // セット選択 → ワークアウト開始の間に広告は挟まない（開始前に3秒カウントダウンがある）
  const onSelect = (sets: SetChoice) =>
    router.push({ pathname: '/workout', params: { course: courseId, sets: String(sets) } });
  return { courseId, onSelect };
}
