"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.enviarUbicacion = enviarUbicacion;
exports.dispararAlerta = dispararAlerta;
const config_1 = require("./config");
async function login(email, password) {
    const r = await fetch(`${config_1.API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    const data = await r.json();
    if (!r.ok) {
        throw new Error(data?.message ?? 'Credenciales incorrectas');
    }
    return data;
}
async function enviarUbicacion(token, idBus, latitud, longitud) {
    const r = await fetch(`${config_1.API_BASE}/api/gps/ubicacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ idBus, latitud, longitud }),
    });
    if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d?.message ?? `Error ${r.status} enviando ubicación`);
    }
}
async function dispararAlerta(token, idBus) {
    const r = await fetch(`${config_1.API_BASE}/api/emergencias/alerta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ idBus, tipo: 'PANICO_MANUAL' }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok)
        throw new Error(d?.message ?? `Error ${r.status} enviando alerta`);
    return d;
}
//# sourceMappingURL=api.js.map