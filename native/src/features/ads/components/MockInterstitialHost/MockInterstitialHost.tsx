import { useEffect, useRef, useState } from 'react';
import { Modal, View } from 'react-native';

import { Button } from '@/shared/components/ui/button';
import { Text } from '@/shared/components/ui/text';
import { t } from '@/shared/i18n';

import { registerMockInterstitialPresenter } from '../../lib/interstitialAdClient';

/**
 * 開発用のダミー全画面広告。ルートレイアウトに1つだけ置く。
 * 広告の表示タイミング（完了5秒後など）を実機で確認するためのもの。
 */
export function MockInterstitialHost() {
  const [visible, setVisible] = useState(false);
  const resolveRef = useRef<(() => void) | null>(null);

  useEffect(
    () =>
      registerMockInterstitialPresenter(
        () =>
          new Promise<void>((resolve) => {
            resolveRef.current = resolve;
            setVisible(true);
          }),
      ),
    [],
  );

  const close = () => {
    setVisible(false);
    resolveRef.current?.();
    resolveRef.current = null;
  };

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={close}>
      <View className="flex-1 items-center justify-center gap-6 bg-foreground p-8">
        <Text className="text-3xl font-bold text-background">{t('ad.mockInterstitial')}</Text>
        <Button variant="secondary" size="lg" onPress={close}>
          <Text>{t('ad.close')}</Text>
        </Button>
      </View>
    </Modal>
  );
}
