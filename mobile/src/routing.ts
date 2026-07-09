import { LatLng } from './mockData';

export type RoadRoute = {
  coords: LatLng[];      // polilínea densa siguiendo las calles ([lat, lng])
  durationSec: number;   // duración estimada de manejo (real)
  distanceM: number;     // distancia total en metros
  snapped: boolean;      // true si vino del motor de ruteo; false si fallback
};

// Traza una ruta que sigue las calles reales usando OSRM (servidor demo
// público, sin API key). Para producción conviene un proveedor con key
// (Mapbox / OpenRouteService) o un OSRM propio.
export async function getRoadRoute(waypoints: LatLng[]): Promise<RoadRoute> {
  // OSRM espera "lon,lat;lon,lat;..."
  const coordStr = waypoints.map(([la, ln]) => `${ln},${la}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson`;

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 9000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes?.length) throw new Error('ruta no encontrada');

    const route = data.routes[0];
    // GeoJSON viene como [lon, lat] → lo pasamos a [lat, lng]
    const coords: LatLng[] = route.geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
    return { coords, durationSec: route.duration, distanceM: route.distance, snapped: true };
  } catch {
    // Sin internet o rate-limit: caemos a los waypoints en línea recta.
    return { coords: waypoints, durationSec: 0, distanceM: 0, snapped: false };
  }
}

// ── Utilidades de distancia / proyección ──

// Distancia en metros entre dos coordenadas (fórmula de Haversine).
export function metrosEntre(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const la1 = (a[0] * Math.PI) / 180;
  const la2 = (b[0] * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Distancias acumuladas (metros) a lo largo de una polilínea.
export function distanciasAcumuladas(coords: LatLng[]): { cum: number[]; total: number } {
  const cum = [0];
  for (let i = 1; i < coords.length; i++) cum[i] = cum[i - 1] + metrosEntre(coords[i - 1], coords[i]);
  return { cum, total: cum.length ? cum[cum.length - 1] : 0 };
}

// Proyecta un punto (el pasajero) sobre la ruta: devuelve el vértice más
// cercano (su "parada"), a qué distancia va sobre la ruta y qué tan lejos
// está de la ruta (crossM: si es grande, el pasajero no está sobre la ruta).
export function proyectar(coords: LatLng[], cum: number[], punto: LatLng): { idx: number; alongM: number; crossM: number } {
  let best = Infinity;
  let idx = 0;
  for (let i = 0; i < coords.length; i++) {
    const d = metrosEntre(coords[i], punto);
    if (d < best) { best = d; idx = i; }
  }
  return { idx, alongM: cum[idx] ?? 0, crossM: best };
}

// ── Tráfico simulado por hora del día ──
// OSRM gratis no trae tráfico en vivo; simulamos congestión según la hora real
// del teléfono (horas pico = más lento). Reemplazable por un proveedor con
// tráfico real (Mapbox/Google/TomTom) sin tocar el resto de la app.
export type Trafico = { nivel: 'Fluido' | 'Moderado' | 'Pesado'; factor: number; color: string };

export function getTraficoAhora(): Trafico {
  const h = new Date().getHours();
  const pico = (h >= 7 && h <= 9) || (h >= 17 && h <= 19);
  const medio = (h >= 6 && h <= 10) || (h >= 16 && h <= 20);
  if (pico) return { nivel: 'Pesado', factor: 1.6, color: '#EF4444' };
  if (medio) return { nivel: 'Moderado', factor: 1.3, color: '#F59E0B' };
  return { nivel: 'Fluido', factor: 1.05, color: '#16A34A' };
}
