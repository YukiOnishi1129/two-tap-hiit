import { SettingsScreenPresenter } from './SettingsScreenPresenter';
import { useSettingsScreen } from './useSettingsScreen';

export function SettingsScreenContainer() {
  return <SettingsScreenPresenter {...useSettingsScreen()} />;
}
