import { loadApiBase, saveApiBase } from './utils/storage';

const DEFAULT_API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.2:3000';

let cachedApiBase: string = DEFAULT_API_BASE;

export function getApiBase(): string {
  return cachedApiBase;
}

export function setApiBase(url: string): void {
  const trimmed = url.replace(/\/+$/, '');
  cachedApiBase = trimmed;
}

export async function initApiBase(): Promise<string> {
  const stored = await loadApiBase();
  if (stored) {
    cachedApiBase = stored;
  }
  return cachedApiBase;
}

export async function persistApiBase(url: string): Promise<void> {
  setApiBase(url);
  await saveApiBase(url);
}

export function getDefaultApiBase(): string {
  return DEFAULT_API_BASE;
}
