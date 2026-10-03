import { z } from 'zod';

export const PreferencesSchema = z.object({
  soundEnabled: z.boolean(),
  vibrationEnabled: z.boolean(),
  // 後から追加した項目。古い保存データに無くても読めるようにデフォルト値をつける
  bgmEnabled: z.boolean().default(true),
});
export type Preferences = z.infer<typeof PreferencesSchema>;

export const DEFAULT_PREFERENCES: Preferences = {
  soundEnabled: true,
  vibrationEnabled: true,
  bgmEnabled: true,
};
