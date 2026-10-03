import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { getPreferences, savePreferences } from '../../repository/preferencesRepository';
import { DEFAULT_PREFERENCES, type Preferences } from '../../types/preferences';

export function useSettingsScreen() {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);

  useFocusEffect(
    useCallback(() => {
      void getPreferences().then(setPreferences);
    }, []),
  );

  const update = (patch: Partial<Preferences>) => {
    const next = { ...preferences, ...patch };
    setPreferences(next);
    void savePreferences(next);
  };

  return {
    preferences,
    onToggleBgm: (bgmEnabled: boolean) => update({ bgmEnabled }),
    onToggleSound: (soundEnabled: boolean) => update({ soundEnabled }),
    onToggleVibration: (vibrationEnabled: boolean) => update({ vibrationEnabled }),
  };
}
