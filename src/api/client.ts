import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Base URL configuration:
 *   Physical device (USB + adb reverse tcp:8080 tcp:8080) → localhost
 *   Android emulator  → 10.0.2.2  (maps to host machine's localhost)
 *   iOS simulator     → localhost
 *
 * Current setup: physical device with adb reverse active.
 * If switching to emulator, change to 'http://10.0.2.2:8080'.
 */
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
