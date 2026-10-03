import { type AppConfig, DEFAULT_APP_CONFIG, ensureAppConfig } from './appConfig';
import { fetchRemoteConfig } from './remoteConfigClient';

// アプリ設定。まずローカルのデフォルト値で動き、サーバーから取れたら上書きする。
// 起動中は1回だけ取得してメモリに保持する。

let cached: Promise<AppConfig> | null = null;

export function getAppConfig(): Promise<AppConfig> {
  cached ??= fetchRemoteConfig()
    .then((response) => (response === null ? DEFAULT_APP_CONFIG : ensureAppConfig(response)))
    .catch(() => DEFAULT_APP_CONFIG);
  return cached;
}
