import { getLocales } from 'expo-localization';

import { en, type MessageKey } from './en';
import { ja } from './ja';

export type { MessageKey };
export type Locale = 'ja' | 'en';

// 端末の言語が日本語なら日本語、それ以外はすべて英語。
// 起動中に言語が変わるケースは考慮しない（OS 側で言語を変えるとアプリは再起動される）。
// 開発時は EXPO_PUBLIC_LOCALE=ja / en で端末の言語に関係なく切り替えられる（`npm run ios:ja` など）。
function detectLocale(): Locale {
  const forced = process.env.EXPO_PUBLIC_LOCALE;
  if (forced === 'ja' || forced === 'en') return forced;
  return getLocales()[0]?.languageCode === 'ja' ? 'ja' : 'en';
}

export const locale: Locale = detectLocale();

const messages: Record<MessageKey, string> = locale === 'ja' ? ja : en;

/** 文言を取得する。`{name}` 形式のプレースホルダーを params で置き換える。 */
export function t(key: MessageKey, params?: Record<string, string | number>): string {
  const template = messages[key];
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

/** 秒数を「2分45秒」「3 min」のように表示する。 */
export function formatDuration(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return s === 0 ? t('time.min', { m }) : t('time.minSec', { m, s });
}

/** 「2026年10月」「October 2026」のような月の見出し。 */
export function formatMonth(year: number, month: number): string {
  return new Intl.DateTimeFormat(locale === 'ja' ? 'ja-JP' : 'en-US', {
    year: 'numeric',
    month: 'long',
  }).format(new Date(year, month, 1));
}
