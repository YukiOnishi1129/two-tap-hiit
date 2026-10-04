import { useEffect } from 'react';

import { initializeAds } from '../../lib/admobClient';

/**
 * 起動時に広告 SDK を準備する（同意フォーム → iOS のトラッキング許可 → 初期化）。
 * ルートレイアウトに1つだけ置く。画面には何も表示しない。
 */
export function AdsBootstrap() {
  useEffect(() => {
    void initializeAds();
  }, []);
  return null;
}
