"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TIPOS_INCIDENTE = exports.RUTAS = void 0;
const theme_1 = require("./theme");
exports.RUTAS = [
    {
        id: 'l14', idBus: 'BUS-014', nombre: 'Línea 14', etiqueta: 'Semisótano',
        origen: 'Terminal Sur', destino: 'Centro Histórico',
        minutos: 4, paradas: 12, tipoBus: 'Bus eléctrico', color: theme_1.colors.blue,
    },
    {
        id: 'l27', idBus: 'BUS-027', nombre: 'Línea 27', etiqueta: 'Expreso Occidental',
        origen: 'Villa del Río', destino: 'Aeropuerto',
        minutos: 7, paradas: 8, tipoBus: 'Bus articulado', color: theme_1.colors.purple,
    },
    {
        id: 'ss', idBus: 'BUS-SS1', nombre: 'Semisótano', etiqueta: 'Ruta Expresa',
        origen: 'Zona Industrial', destino: 'Plaza Mayor',
        minutos: 11, paradas: 6, tipoBus: 'Bus rápido', color: theme_1.colors.orange,
    },
    {
        id: 'cn', idBus: 'BUS-CN1', nombre: 'Centro Norte', etiqueta: 'Troncal Norte',
        origen: 'Terminal Norte', destino: 'Centro Cívico',
        minutos: 15, paradas: 18, tipoBus: 'Bus convencional', color: theme_1.colors.green,
    },
];
exports.TIPOS_INCIDENTE = [
    { id: 'robo', titulo: 'Robo / Asalto', descripcion: 'Emergencia en proceso', icon: 'alert', color: theme_1.colors.red, colorSoft: theme_1.colors.redSoft },
    { id: 'acoso', titulo: 'Acoso / Sospecha', descripcion: 'Situación sospechosa', icon: 'help', color: theme_1.colors.orange, colorSoft: theme_1.colors.orangeSoft },
    { id: 'falla', titulo: 'Falla mecánica', descripcion: 'Accidente o daño de unidad', icon: 'bus', color: theme_1.colors.blue, colorSoft: '#DDE3F5' },
];
//# sourceMappingURL=mockData.js.map