import { colors } from './theme';

// ── Rutas (mock por ahora; el backend aún no tiene módulo de rutas/líneas) ──
// Cada ruta lleva un `idBus` real: el mapa se suscribe a `bus_<idBus>` por
// WebSocket y el simulador envía GPS a ese id, así el mapa SÍ es en vivo.
export type LatLng = [number, number];

export type Ruta = {
  id: string;
  idBus: string;
  nombre: string;
  etiqueta: string;
  origen: string;
  destino: string;
  minutos: number;       // duración total del recorrido
  frecuenciaMin: number; // cada cuántos minutos pasa un bus de la línea (headway)
  paradas: number;
  tipoBus: string;
  color: string;
  // Geometría de la IDA: primer punto = origen, último = destino.
  path: LatLng[];
  nombresParadas: string[];
  // Geometría de la VUELTA (opcional). Si no se define, la vuelta usa la ida
  // invertida. Aquí se puede poner un recorrido de retorno por otras calles.
  pathVuelta?: LatLng[];
  nombresParadasVuelta?: string[];
  // Ruta real (coordenadas verdaderas): NO se traslada a la zona del usuario.
  real?: boolean;
};

export type Sentido = 'ida' | 'vuelta';

export const RUTAS: Ruta[] = [
  {
    // Ruta REAL de Quito — Cooperativa Águila Dorada, bus #53.
    // Corredor: El Condado → La Prensa → La Y → 10 de Agosto → Congreso.
    id: 'aguila53', idBus: 'AGUILA-53', nombre: 'Águila Dorada', etiqueta: 'Condado – Congreso',
    origen: 'El Condado', destino: 'Congreso',
    minutos: 37, frecuenciaMin: 10, paradas: 24, tipoBus: 'Bus urbano (Quito)', color: '#C9962B',
    real: true,
    // Waypoints sobre avenidas reales (verificado con OSRM: sin desvíos/ganchos).
    path: [
      [-0.0967, -78.4939], [-0.1290, -78.4880], [-0.1746, -78.4869],
      [-0.1950, -78.4930], [-0.2100, -78.5010],
    ],
    nombresParadas: ['El Condado', 'La Prensa', 'La Y', 'Santa Clara', 'Congreso'],
    // VUELTA (Congreso → El Condado) por un corredor distinto (aprox. Av. América),
    // pero sobre calles con buena conexión para que el trazado no se devuelva.
    pathVuelta: [
      [-0.2100, -78.5010], [-0.1950, -78.4985], [-0.1746, -78.4955],
      [-0.1500, -78.4915], [-0.1200, -78.4860], [-0.0967, -78.4939],
    ],
    nombresParadasVuelta: ['Congreso', 'Av. América', 'La Y', 'La Concepción', 'La Prensa', 'El Condado'],
  },
  // ── Cooperativas de bus urbano de Quito (líneas reales; recorridos aprox.) ──
  // Varias pasan por la Universidad Central (UCE), sector La Gasca.
  {
    id: 'alfa', idBus: 'ALFA-01', nombre: 'Trans Alfa', etiqueta: 'La Gasca – Guajaló',
    origen: 'La Gasca (UCE)', destino: 'Guajaló',
    minutos: 42, frecuenciaMin: 8, paradas: 26, tipoBus: 'Bus urbano · Coop. Alfa', color: '#7E57C2',
    real: true,
    path: [
      [-0.1960, -78.5060], [-0.1985, -78.5045], [-0.2100, -78.5000],
      [-0.2205, -78.5090], [-0.2500, -78.5230], [-0.2780, -78.5390],
      [-0.2870, -78.5410],
    ],
    nombresParadas: ['La Gasca (UCE)', 'Miraflores', 'El Ejido', 'La Marín', 'El Recreo', 'Solanda', 'Guajaló'],
  },
  {
    id: 'latina', idBus: 'LATINA-01', nombre: 'Latina', etiqueta: 'Carcelén – UCE',
    origen: 'Carcelén', destino: 'Universidad Central',
    minutos: 38, frecuenciaMin: 12, paradas: 24, tipoBus: 'Bus urbano · Coop. Latina', color: '#EF6C00',
    real: true,
    path: [
      [-0.0990, -78.4790], [-0.1450, -78.4720], [-0.1750, -78.4870],
      [-0.1830, -78.4850], [-0.1950, -78.4950], [-0.1985, -78.5045],
    ],
    nombresParadas: ['Carcelén', 'El Inca', 'La Y', 'La Carolina', 'Santa Clara', 'Universidad Central'],
  },
  {
    id: 'qlibre', idBus: 'QLIBRE-01', nombre: 'Quiteño Libre', etiqueta: 'Cotocollao – El Recreo',
    origen: 'Cotocollao', destino: 'El Recreo',
    minutos: 45, frecuenciaMin: 9, paradas: 28, tipoBus: 'Bus urbano · Coop. Quiteño Libre', color: '#00897B',
    real: true,
    path: [
      [-0.1080, -78.4890], [-0.1750, -78.4870], [-0.1985, -78.5045],
      [-0.2100, -78.5000], [-0.2205, -78.5090], [-0.2500, -78.5230],
    ],
    nombresParadas: ['Cotocollao', 'La Y', 'Universidad Central', 'El Ejido', 'La Marín', 'El Recreo'],
  },
  {
    id: 'sancarlos', idBus: 'SANCARLOS-01', nombre: 'San Carlos', etiqueta: 'San Carlos – La Marín',
    origen: 'San Carlos', destino: 'La Marín',
    minutos: 34, frecuenciaMin: 13, paradas: 20, tipoBus: 'Bus urbano · Coop. San Carlos', color: '#5D4037',
    real: true,
    path: [
      [-0.1350, -78.5050], [-0.1700, -78.4950], [-0.1985, -78.5045],
      [-0.2100, -78.5000], [-0.2205, -78.5090],
    ],
    nombresParadas: ['San Carlos', 'La Concepción', 'Universidad Central', 'El Ejido', 'La Marín'],
  },
  {
    id: 'marcopolo', idBus: 'MARCOPOLO-01', nombre: 'Marco Polo', etiqueta: 'Comité del Pueblo – Villa Flora',
    origen: 'Comité del Pueblo', destino: 'Villa Flora',
    minutos: 40, frecuenciaMin: 11, paradas: 25, tipoBus: 'Bus urbano · Coop. Marco Polo', color: '#AD1457',
    real: true,
    path: [
      [-0.1250, -78.4650], [-0.1450, -78.4720], [-0.1750, -78.4870],
      [-0.1950, -78.4950], [-0.1985, -78.5045], [-0.2100, -78.5000],
      [-0.2350, -78.5150],
    ],
    nombresParadas: ['Comité del Pueblo', 'El Inca', 'La Y', 'Santa Clara', 'Universidad Central', 'El Ejido', 'Villa Flora'],
  },
];

// ── Tipos de incidente (Reportes) ──
// El backend solo distingue PANICO_MANUAL / IA_ACUSTICO; para la demo todos
// se envían como PANICO_MANUAL. La categoría fina es visual por ahora.
export type TipoIncidente = {
  id: string;
  titulo: string;
  descripcion: string;
  icon: 'alert' | 'help' | 'bus';
  color: string;
  colorSoft: string;
};

export const TIPOS_INCIDENTE: TipoIncidente[] = [
  { id: 'robo', titulo: 'Robo / Asalto', descripcion: 'Emergencia en proceso', icon: 'alert', color: colors.red, colorSoft: colors.redSoft },
  { id: 'acoso', titulo: 'Acoso / Sospecha', descripcion: 'Situación sospechosa', icon: 'help', color: colors.orange, colorSoft: colors.orangeSoft },
  { id: 'falla', titulo: 'Falla mecánica', descripcion: 'Accidente o daño de unidad', icon: 'bus', color: colors.blue, colorSoft: '#DDE3F5' },
];
