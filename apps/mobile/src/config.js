import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Dynamically resolves the backend API host:
 * - On Web: http://localhost:3000
 * - In Expo Go on physical device: Uses the LAN IP running Metro (e.g. 10.117.168.15)
 * - In Android Emulator: Falls back to 10.0.2.2 or LAN IP
 */
function resolveApiBaseUrl() {
  if (Platform.OS === 'web') {
    return 'http://localhost:3000';
  }

  // Extract host IP from Expo hostUri (e.g. 10.117.168.15:8081)
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    Constants.manifest?.debuggerHost;

  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:3000`;
    }
  }

  // Active machine Wi-Fi LAN IP fallback
  return 'http://10.117.168.15:3000';
}

export const DEFAULT_API_URL = resolveApiBaseUrl();

console.log('[NIRVANA CONFIG] API Base URL resolved to:', DEFAULT_API_URL);

export const CONFIG = {
  API_BASE_URL: DEFAULT_API_URL,
  SOCKET_URL: DEFAULT_API_URL,
  OFFLINE_SYNC_INTERVAL_MS: 15000,
  DEMO_OTP: '123456'
};
