import { z } from 'zod';

export const PreferencesSchema = z.object({
  soundEnabled: z.boolean(),
  vibrationEnabled: z.boolean(),
});
export type Preferences = z.infer<typeof PreferencesSchema>;

export const DEFAULT_PREFERENCES: Preferences = {
  soundEnabled: true,
  vibrationEnabled: true,
};
