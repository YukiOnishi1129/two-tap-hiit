import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router/js-tabs';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';

import { tryShowInterstitial } from '@/features/ads';
import { t } from '@/shared/i18n';

const PRIMARY = 'hsl(17, 87%, 45%)';
const MUTED = 'hsl(42, 7%, 35%)';
const BACKGROUND = 'hsl(60, 23%, 97%)';

/**
 * ホーム⇔記録のタブ切り替え時の広告。
 * 出せる条件（1日1回・確率・直前の広告から3分）なら表示して、閉じてから切り替える。
 * 条件を満たさなければ、そのまま切り替える。
 */
const transitionAdListeners: ComponentProps<typeof Tabs.Screen>['listeners'] = ({ navigation, route }) => ({
  tabPress: (event) => {
    if (navigation.isFocused()) return; // いまのタブを押し直しただけ
    event.preventDefault();
    void tryShowInterstitial('recordsTransition').then(() => navigation.navigate(route.name));
  },
});

type TabIconProps = { color: ColorValue; focused: boolean; size: number };

const HomeIcon = ({ color, focused, size }: TabIconProps) => (
  <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
);

const RecordsIcon = ({ color, focused, size }: TabIconProps) => (
  <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={size} color={color} />
);

const SettingsIcon = ({ color, focused, size }: TabIconProps) => (
  <Ionicons name={focused ? 'settings' : 'settings-outline'} size={size} color={color} />
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PRIMARY,
        tabBarInactiveTintColor: MUTED,
        tabBarStyle: { backgroundColor: BACKGROUND },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}>
      <Tabs.Screen
        name="index"
        listeners={transitionAdListeners}
        options={{
          title: t('tabs.home'),
          tabBarIcon: HomeIcon,
        }}
      />
      <Tabs.Screen
        name="records"
        listeners={transitionAdListeners}
        options={{
          title: t('tabs.records'),
          tabBarIcon: RecordsIcon,
        }}
      />
      {/* 設定（将来の「広告を消す」もここ）へ行くときは広告を出さない */}
      <Tabs.Screen name="settings" options={{ title: t('tabs.settings'), tabBarIcon: SettingsIcon }} />
    </Tabs>
  );
}
