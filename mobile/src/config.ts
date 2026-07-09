import Constants from 'expo-constants';

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

export const API_BASE = `http://${detectarHost()}:${API_PORT}`;

// ID de bus por defecto para la demo.
export const DEFAULT_BUS_ID = 'BUS-001';
