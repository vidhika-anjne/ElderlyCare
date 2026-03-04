import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Base URL configuration:
 *   Physical device (USB) → localhost  ← DEFAULT
 *     Required: run `adb reverse tcp:8080 tcp:8080` each time the device reconnects.
 *   Android emulator      → 10.0.2.2  (maps to host machine's localhost)
 *   iOS simulator         → localhost
 *
 * To switch to Android emulator, change BASE_URL to 'http://10.0.2.2:8080'.
 */

// DEFAULT: physical device via USB with adb reverse active
// Run once per session: adb reverse tcp:8080 tcp:8080
export const BASE_URL = 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// Attach stored JWT to every outgoing request
apiClient.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
