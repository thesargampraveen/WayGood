import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ IMPORTANT:
//  - Android emulator -> 10.0.2.2 is your computer's localhost
//  - Real phone (same WiFi) -> use your computer's IP, e.g. 'http://192.168.1.5:3000'
export const API_BASE_URL = 'http://192.168.0.117:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Automatically attach the saved JWT to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('bhasha_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
