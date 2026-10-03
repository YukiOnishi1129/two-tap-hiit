// サーバーの GET /config を取得する。EXPO_PUBLIC_API_BASE_URL が無ければ何もしない。

const TIMEOUT_MS = 3000;

export async function fetchRemoteConfig(): Promise<unknown> {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (!baseUrl) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/config`, { signal: controller.signal });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
