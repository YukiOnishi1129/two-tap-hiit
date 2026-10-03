import { ScrollView, View } from 'react-native';

import { Screen } from '@/shared/components/Screen';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Switch } from '@/shared/components/ui/switch';
import { Text } from '@/shared/components/ui/text';
import { t } from '@/shared/i18n';
import { cn } from '@/shared/lib/utils';

import type { Preferences } from '../../types/preferences';

export type SettingsScreenPresenterProps = {
  preferences: Preferences;
  onToggleBgm: (value: boolean) => void;
  onToggleSound: (value: boolean) => void;
  onToggleVibration: (value: boolean) => void;
};

export function SettingsScreenPresenter(props: SettingsScreenPresenterProps) {
  return (
    <Screen>
      <View className="px-5 pb-2 pt-4">
        <Text variant="h3">{t('settings.title')}</Text>
      </View>
      <ScrollView contentContainerClassName="gap-5 px-5 pb-8">
        <View className="gap-2">
          <Text variant="muted">{t('settings.workoutSection')}</Text>
          <Card className="py-1">
            <CardContent className="px-4">
              <SettingRow
                label={t('settings.bgm')}
                description={t('settings.bgmDescription')}
                value={props.preferences.bgmEnabled}
                onChange={props.onToggleBgm}
              />
              <SettingRow
                label={t('settings.sound')}
                description={t('settings.soundDescription')}
                value={props.preferences.soundEnabled}
                onChange={props.onToggleSound}
                divider
              />
              <SettingRow
                label={t('settings.vibration')}
                description={t('settings.vibrationDescription')}
                value={props.preferences.vibrationEnabled}
                onChange={props.onToggleVibration}
                divider
              />
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}

type SettingRowProps = {
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
  divider?: boolean;
};

function SettingRow({ label, description, value, onChange, divider = false }: SettingRowProps) {
  return (
    <View className={cn('flex-row items-center gap-4 py-3.5', divider && 'border-t border-border')}>
      <View className="flex-1 gap-0.5">
        <Text className="text-base font-medium">{label}</Text>
        <Text variant="muted">{description}</Text>
      </View>
      <Switch checked={value} onCheckedChange={onChange} accessibilityLabel={label} />
    </View>
  );
}
