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
export declare const RUTAS: Ruta[];
export type TipoIncidente = {
    id: string;
    titulo: string;
    descripcion: string;
    icon: 'alert' | 'help' | 'bus';
    color: string;
    colorSoft: string;
};
export declare const TIPOS_INCIDENTE: TipoIncidente[];
