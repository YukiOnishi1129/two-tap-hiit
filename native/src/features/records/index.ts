// records feature の公開 API。他の feature / app からはここ経由で使う。
export { RecordsScreen } from './components/RecordsScreen';
export { WeekDots } from './components/WeekDots';
export { getCompletedDates, getWeekDays, type WeekDay } from './domain/recordStats';
export { addWorkoutCompletion, listWorkoutCompletions } from './repository/workoutCompletionRepository';
export type { WorkoutCompletion } from './types/workoutCompletion';
