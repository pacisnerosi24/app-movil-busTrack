// mobile/src/config.ts
// Base URL del backend NestJS.
//
// IMPORTANTE: el celular NO puede usar "localhost" (eso apunta al propio
// teléfono). Debe apuntar a la IP de la PC donde corre el backend, dentro
// de la misma red WiFi. Si tu IP cambia, actualiza este valor.
export const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.2:3000';

// ID de bus por defecto para la demo.
export const DEFAULT_BUS_ID = 'BUS-001';