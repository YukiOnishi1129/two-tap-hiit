// 広告なしプランの購入状態。
// 将来 App Store / Google Play の購入情報（復元を含む）をここで扱う。ログインは不要にする。

export async function hasNoAdsEntitlement(): Promise<boolean> {
  return false;
}
