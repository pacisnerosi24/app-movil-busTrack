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
  minutos: number;
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
    id: 'aguila53', idBus: 'AGUILA-53', nombre: 'Águila Dorada 53', etiqueta: 'Condado – Congreso',
    origen: 'El Condado', destino: 'Congreso',
    minutos: 37, paradas: 24, tipoBus: 'Bus urbano (Quito)', color: '#C9962B',
    real: true,
    path: [
      [-0.0967, -78.4939], [-0.1080, -78.4865], [-0.1450, -78.4850],
      [-0.1698, -78.4889], [-0.1800, -78.4905], [-0.1965, -78.4925],
      [-0.2020, -78.4950], [-0.2075, -78.4980], [-0.2110, -78.5000],
    ],
    nombresParadas: ['El Condado', 'Cotocollao', 'La Prensa', 'La Y', 'La Gasca', 'Av. Colón', 'Santa Clara', 'El Ejido', 'Congreso'],
  },
  {
    id: 'l14', idBus: 'BUS-014', nombre: 'Línea 14', etiqueta: 'Semisótano',
    origen: 'Terminal Sur', destino: 'Centro Histórico',
    minutos: 4, paradas: 12, tipoBus: 'Bus eléctrico', color: colors.blue,
    path: [
      [-2.2005, -79.8990], [-2.1960, -79.9020], [-2.1900, -79.9055],
      [-2.1848, -79.9108], [-2.1788, -79.9162], [-2.1720, -79.9212],
    ],
    nombresParadas: ['Terminal Sur', 'Av. 25 de Julio', 'Barrio Cuba', 'Las Peñas', 'Malecón 2000', 'Centro Histórico'],
  },
  {
    id: 'l27', idBus: 'BUS-027', nombre: 'Línea 27', etiqueta: 'Expreso Occidental',
    origen: 'Villa del Río', destino: 'Aeropuerto',
    minutos: 7, paradas: 8, tipoBus: 'Bus articulado', color: colors.purple,
    path: [
      [-2.2200, -79.9300], [-2.2090, -79.9245], [-2.1965, -79.9150],
      [-2.1840, -79.9050], [-2.1700, -79.8950], [-2.1572, -79.8845],
    ],
    nombresParadas: ['Villa del Río', 'Puente Portete', 'Terminal Río', 'Av. Las Américas', 'CC Aeropuerto', 'Aeropuerto'],
  },
  {
    id: 'ss', idBus: 'BUS-SS1', nombre: 'Semisótano', etiqueta: 'Ruta Expresa',
    origen: 'Zona Industrial', destino: 'Plaza Mayor',
    minutos: 11, paradas: 6, tipoBus: 'Bus rápido', color: colors.orange,
    path: [
      [-2.1400, -79.9000], [-2.1480, -79.9082], [-2.1560, -79.9150],
      [-2.1638, -79.9200], [-2.1702, -79.9232], [-2.1762, -79.9255],
    ],
    nombresParadas: ['Zona Industrial', 'Vía Daule', 'Prosperina', 'Urdesa', 'Policentro', 'Plaza Mayor'],
  },
  {
    id: 'cn', idBus: 'BUS-CN1', nombre: 'Centro Norte', etiqueta: 'Troncal Norte',
    origen: 'Terminal Norte', destino: 'Centro Cívico',
    minutos: 15, paradas: 18, tipoBus: 'Bus convencional', color: colors.green,
    path: [
      [-2.1200, -79.8950], [-2.1350, -79.9005], [-2.1500, -79.9085],
      [-2.1620, -79.9150], [-2.1720, -79.9200], [-2.1782, -79.9238],
    ],
    nombresParadas: ['Terminal Norte', 'Bastión Popular', 'Guasmo Norte', 'Alborada', 'Garzota', 'Centro Cívico'],
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
