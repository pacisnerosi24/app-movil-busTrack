import Constants from 'expo-constants';
import { loadApiBase, saveApiBase, clearApiBase } from './utils/storage';

// Puerto del backend NestJS.
const API_PORT = 3000;

// IP de respaldo por si no se puede autodetectar (rara vez se usa).
// Actualízala solo si la detección automática falla.
const FALLBACK_HOST = '172.20.10.2';

// Detecta automáticamente la IP de la Mac donde corre el backend.
//
// El teléfono ya se conecta a Metro/Expo en esa misma IP, así que la
// reutilizamos para el backend (que corre en la misma máquina). Así NO hay
// que quemar la IP: la app sigue a Expo dondequiera que esté.
function detectarHost(): string {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).expoGoConfig?.debuggerHost ||
    (Constants as any).manifest?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;

  const host = hostUri?.split(':')[0];
  return host && host !== 'localhost' && host !== '127.0.0.1' ? host : FALLBACK_HOST;
}

// URL por defecto = IP autodetectada de la Mac (misma WiFi).
const DEFAULT_API_BASE = `http://${detectarHost()}:${API_PORT}`;

// URL activa en memoria. Arranca en la autodetectada; si el usuario guardó
// una URL manual (ej. túnel ngrok para la feria) esa tiene prioridad.
let cachedApiBase = DEFAULT_API_BASE;

export function getDefaultApiBase(): string {
  return DEFAULT_API_BASE;
}

export function getApiBase(): string {
  return cachedApiBase;
}

export function setApiBase(url: string): void {
  cachedApiBase = url.replace(/\/+$/, ''); // sin barra final
}

// Al arrancar la app: si hay una URL guardada, la usa; si no, la autodetectada.
export async function initApiBase(): Promise<string> {
  const stored = await loadApiBase();
  if (stored) cachedApiBase = stored;
  return cachedApiBase;
}

// Guarda una URL manual y la deja activa (usada desde Ajustes).
export async function persistApiBase(url: string): Promise<void> {
  setApiBase(url);
  await saveApiBase(cachedApiBase);
}

// Vuelve a la autodetección (borra el override guardado).
export async function resetApiBase(): Promise<string> {
  await clearApiBase();
  cachedApiBase = DEFAULT_API_BASE;
  return cachedApiBase;
}

// ID de bus por defecto para la demo.
export const DEFAULT_BUS_ID = 'BUS-001';
