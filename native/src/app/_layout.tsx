import '../../global.css';

import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AdsBootstrap } from '@/features/ads';
import { t } from '@/shared/i18n';

const BACKGROUND = 'hsl(60, 23%, 97%)';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: BACKGROUND },
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: BACKGROUND },
        }}>
        {/* ホーム・記録のタブ。コース選択以降はタブの上に重ねて表示する（ワークアウト中はタブバーが出ない） */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="course" options={{ title: t('course.title') }} />
        <Stack.Screen name="sets" options={{ title: t('sets.title') }} />
        {/* ワークアウト中・完了画面はスワイプで戻れないようにする */}
        <Stack.Screen name="workout" options={{ headerShown: false, gestureEnabled: false, animation: 'fade' }} />
        <Stack.Screen name="complete" options={{ headerShown: false, gestureEnabled: false, animation: 'fade' }} />
      </Stack>
      <AdsBootstrap />
      <PortalHost />
    </>
  );
}
