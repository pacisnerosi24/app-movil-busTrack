import { getApiBase } from './config';

export type Usuario = { id: string; email: string; rol: string };
export type LoginResp = { token: string; usuario: Usuario };

export type Rol = 'conductor' | 'pasajero';
export type RegistroResp = { mensaje: string; usuario: Usuario };

// Prueba que una URL de backend responda (health check GET /).
// La usa la pantalla de Ajustes antes de guardar la URL.
export async function testConnection(base: string): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    const r = await fetch(`${base.replace(/\/+$/, '')}/`, { signal: ctrl.signal });
    clearTimeout(timer);
    return r.ok;
  } catch {
    return false;
  }
}

// Registra un usuario nuevo (POST /api/auth/registro).
export async function registrar(email: string, password: string, rol: Rol): Promise<RegistroResp> {
  const r = await fetch(`${getApiBase()}/api/auth/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, rol }),
  });
  const data = await r.json();
  if (!r.ok) {
    // NestJS devuelve los errores de validación como arreglo.
    const msg = Array.isArray(data?.message) ? data.message[0] : data?.message;
    throw new Error(msg ?? 'No se pudo crear la cuenta');
  }
  return data as RegistroResp;
}

export async function login(email: string, password: string): Promise<LoginResp> {
  const r = await fetch(`${getApiBase()}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await r.json();
  if (!r.ok) {
    throw new Error(data?.message ?? 'Credenciales incorrectas');
  }
  return data as LoginResp;
}

// Envía una ubicación GPS (endpoint protegido con JWT).
export async function enviarUbicacion(
  token: string,
  idBus: string,
  latitud: number,
  longitud: number,
): Promise<void> {
  const r = await fetch(`${getApiBase()}/api/gps/ubicacion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ idBus, latitud, longitud }),
  });
  if (!r.ok) {
    const d = await r.json().catch(() => ({}));
    throw new Error(d?.message ?? `Error ${r.status} enviando ubicación`);
  }
}

export type AlertaResp = { mensaje: string; alertaId: string; esCritica: boolean };

// Dispara una alerta de emergencia (endpoint real del módulo seguridad).
// El backend solo acepta PANICO_MANUAL / IA_ACUSTICO, así que la demo envía
// PANICO_MANUAL para cualquier tipo de incidente reportado.
export async function dispararAlerta(token: string, idBus: string): Promise<AlertaResp> {
  const r = await fetch(`${getApiBase()}/api/emergencias/alerta`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ idBus, tipo: 'PANICO_MANUAL' }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d?.message ?? `Error ${r.status} enviando alerta`);
  return d as AlertaResp;
}
