import { DEFAULT_PREFERENCES, type Preferences, PreferencesSchema } from '../types/preferences';

import { readJson, writeJson } from '@/shared/lib/storage';

const KEY = 'preferences:v1';

export function getPreferences(): Promise<Preferences> {
  return readJson(KEY, PreferencesSchema, DEFAULT_PREFERENCES);
}

export function savePreferences(preferences: Preferences): Promise<void> {
  return writeJson(KEY, preferences);
}
