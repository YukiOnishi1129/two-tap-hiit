import { type AdThrottleState, AdThrottleStateSchema, INITIAL_AD_THROTTLE_STATE } from '../types/adThrottleState';

import { readJson, writeJson } from '@/shared/lib/storage';

const KEY = 'adThrottle:v1';

export function getAdThrottleState(): Promise<AdThrottleState> {
  return readJson(KEY, AdThrottleStateSchema, INITIAL_AD_THROTTLE_STATE);
}

export function saveAdThrottleState(state: AdThrottleState): Promise<void> {
  return writeJson(KEY, state);
}
