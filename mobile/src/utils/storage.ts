import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  API_BASE: '@rutasegura/api_base',
} as const;

export async function loadApiBase(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.API_BASE);
  } catch {
    return null;
  }
}

export async function saveApiBase(url: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.API_BASE, url);
}

export async function clearApiBase(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.API_BASE);
}
