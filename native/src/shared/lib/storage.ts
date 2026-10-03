import AsyncStorage from '@react-native-async-storage/async-storage';
import type { z } from 'zod';

// AsyncStorage に JSON を保存・取得する共通処理。
// 壊れたデータや古い形式のデータは fallback に置き換えて、アプリが落ちないようにする。

export async function readJson<T>(key: string, schema: z.ZodType<T>, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = schema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : fallback;
  } catch {
    return fallback;
  }
}

export async function writeJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}
