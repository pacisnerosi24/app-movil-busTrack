import { getApiBase } from './config';

export type Usuario = { id: string; email: string; rol: string };
export type LoginResp = { token: string; usuario: Usuario };

export async function login(email: string, password: string): Promise<LoginResp> {
  const base = getApiBase();
  const r = await fetch(`${base}/api/auth/login`, {
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

export async function enviarUbicacion(
  token: string,
  idBus: string,
  latitud: number,
  longitud: number,
): Promise<void> {
  const base = getApiBase();
  const r = await fetch(`${base}/api/gps/ubicacion`, {
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

export async function dispararAlerta(token: string, idBus: string): Promise<AlertaResp> {
  const base = getApiBase();
  const r = await fetch(`${base}/api/emergencias/alerta`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ idBus, tipo: 'PANICO_MANUAL' }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d?.message ?? `Error ${r.status} enviando alerta`);
  return d as AlertaResp;
}

export async function testConnection(baseUrl: string): Promise<boolean> {
  try {
    const r = await fetch(`${baseUrl.replace(/\/+$/, '')}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test', password: 'test' }),
    });
    await r.json();
    return r.status !== 502 && r.status !== 503 && r.status !== 404;
  } catch {
    return false;
  }
}
