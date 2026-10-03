import type { CourseId, ExerciseId } from '@/shared/domain/workout';
import { t } from '@/shared/i18n';

export const exerciseName = (id: ExerciseId): string => t(`exercise.${id}`);
export const courseName = (id: CourseId): string => t(`course.${id}.name`);
export const courseDescription = (id: CourseId): string => t(`course.${id}.description`);
