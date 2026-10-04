import {
  getTrackingPermissionsAsync,
  PermissionStatus,
  requestTrackingPermissionsAsync,
} from 'expo-tracking-transparency';
import { Platform, StatusBar } from 'react-native';
import mobileAds, { AdEventType, AdsConsent, InterstitialAd } from 'react-native-google-mobile-ads';

import { adsEnabled, getAdUnitId } from './adUnits';

// AdMob SDK の初期化と、インタースティシャル（全画面広告）の読み込み・表示。
// 広告まわりで何が起きても例外は外に出さない（広告のせいでアプリの操作が止まらないようにする）。

// --- 初期化（同意 → ATT → initialize） ---

let initStarted = false;
let ready = false;
const readyListeners = new Set<() => void>();

export function isAdsReady(): boolean {
  return ready;
}

/** 広告を出せる状態になったら通知を受ける（バナーの表示用）。 */
export function subscribeAdsReady(listener: () => void): () => void {
  readyListeners.add(listener);
  return () => readyListeners.delete(listener);
}

async function canRequestAdsAfterConsent(): Promise<boolean> {
  try {
    // EU などでは同意フォームが出る。日本などでは何も出ずにすぐ終わる
    const info = await AdsConsent.gatherConsent();
    return info.canRequestAds;
  } catch {
    // 同意フォームの取得に失敗しても、以前の同意状態で判断する
    try {
      return (await AdsConsent.getConsentInfo()).canRequestAds;
    } catch {
      return false;
    }
  }
}

async function requestTrackingIfNeeded(): Promise<void> {
  if (Platform.OS !== 'ios') return;
  try {
    const { status } = await getTrackingPermissionsAsync();
    // 許可しなくても広告は出る（パーソナライズされないだけ）
    if (status === PermissionStatus.UNDETERMINED) await requestTrackingPermissionsAsync();
  } catch {
    // 無視
  }
}

/** アプリ起動時に1回だけ呼ぶ。 */
export async function initializeAds(): Promise<void> {
  if (!adsEnabled || initStarted) return;
  initStarted = true;
  try {
    const canRequestAds = await canRequestAdsAfterConsent();
    await requestTrackingIfNeeded();
    if (!canRequestAds) return;
    await mobileAds().initialize();
    ready = true;
    readyListeners.forEach((listener) => listener());
    loadInterstitial();
  } catch {
    // 初期化に失敗したら広告なしで動く
  }
}

// --- インタースティシャル ---

const RETRY_DELAY_MS = 60 * 1000;

let interstitial: InterstitialAd | null = null;
let interstitialLoaded = false;
let onInterstitialFinished: (() => void) | null = null;

function finishShowing(): void {
  onInterstitialFinished?.();
  onInterstitialFinished = null;
}

function loadInterstitial(): void {
  const unitId = getAdUnitId('interstitial');
  if (!unitId || !ready) return;

  if (!interstitial) {
    const ad = InterstitialAd.createForAdRequest(unitId);
    ad.addAdEventListener(AdEventType.LOADED, () => {
      interstitialLoaded = true;
    });
    ad.addAdEventListener(AdEventType.OPENED, () => {
      // iOS で閉じるボタンがステータスバーに隠れないようにする
      if (Platform.OS === 'ios') StatusBar.setHidden(true);
    });
    ad.addAdEventListener(AdEventType.CLOSED, () => {
      if (Platform.OS === 'ios') StatusBar.setHidden(false);
      interstitialLoaded = false;
      finishShowing();
      // 次回用にすぐ読み込んでおく
      ad.load();
    });
    ad.addAdEventListener(AdEventType.ERROR, () => {
      interstitialLoaded = false;
      finishShowing();
      setTimeout(() => ad.load(), RETRY_DELAY_MS);
    });
    interstitial = ad;
  }
  interstitial.load();
}

/** 読み込み済みですぐ表示できるか。読み込み中・失敗中は false（待たずに広告なしで進む）。 */
export function isInterstitialAvailable(): boolean {
  return ready && interstitialLoaded && interstitial !== null;
}

/** 広告を表示し、閉じられたら resolve する。表示できない場合はすぐ resolve する。 */
export function showInterstitial(): Promise<void> {
  const ad = interstitial;
  if (!ad || !isInterstitialAvailable()) return Promise.resolve();
  return new Promise<void>((resolve) => {
    onInterstitialFinished = resolve;
    ad.show().catch(() => finishShowing());
  });
}
