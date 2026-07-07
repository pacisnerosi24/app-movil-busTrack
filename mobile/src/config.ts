// Base URL del backend NestJS.
//
// IMPORTANTE: el celular NO puede usar "localhost" (eso apunta al propio
// teléfono). Debe apuntar a la IP de la Mac donde corre el backend, dentro
// de la misma red WiFi. Si tu IP cambia, actualiza este valor
// (en la Mac: `ipconfig getifaddr en0`).
export const API_BASE = 'http://192.168.100.135:3000';

// ID de bus por defecto para la demo.
export const DEFAULT_BUS_ID = 'BUS-001';
