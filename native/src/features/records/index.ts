// records feature の公開 API。他の feature / app からはここ経由で使う。
export { RecordsScreen } from './components/RecordsScreen';
export { WeekDots } from './components/WeekDots';
export { getCompletedDates, getWeekDays, type WeekDay } from './domain/recordStats';
export { type CompletionSummary, completionId, summarizeCompletion } from './domain/completionSummary';
export { listWorkoutCompletions, saveWorkoutResult } from './repository/workoutCompletionRepository';
export type { WorkoutCompletion, WorkoutResult } from './types/workoutCompletion';
