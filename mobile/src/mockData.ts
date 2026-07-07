import { colors } from './theme';

// ── Rutas (mock por ahora; el backend aún no tiene módulo de rutas/líneas) ──
// Cada ruta lleva un `idBus` real: el mapa se suscribe a `bus_<idBus>` por
// WebSocket y el simulador envía GPS a ese id, así el mapa SÍ es en vivo.
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
};

export const RUTAS: Ruta[] = [
  {
    id: 'l14', idBus: 'BUS-014', nombre: 'Línea 14', etiqueta: 'Semisótano',
    origen: 'Terminal Sur', destino: 'Centro Histórico',
    minutos: 4, paradas: 12, tipoBus: 'Bus eléctrico', color: colors.blue,
  },
  {
    id: 'l27', idBus: 'BUS-027', nombre: 'Línea 27', etiqueta: 'Expreso Occidental',
    origen: 'Villa del Río', destino: 'Aeropuerto',
    minutos: 7, paradas: 8, tipoBus: 'Bus articulado', color: colors.purple,
  },
  {
    id: 'ss', idBus: 'BUS-SS1', nombre: 'Semisótano', etiqueta: 'Ruta Expresa',
    origen: 'Zona Industrial', destino: 'Plaza Mayor',
    minutos: 11, paradas: 6, tipoBus: 'Bus rápido', color: colors.orange,
  },
  {
    id: 'cn', idBus: 'BUS-CN1', nombre: 'Centro Norte', etiqueta: 'Troncal Norte',
    origen: 'Terminal Norte', destino: 'Centro Cívico',
    minutos: 15, paradas: 18, tipoBus: 'Bus convencional', color: colors.green,
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
