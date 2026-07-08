import { ReactNode } from 'react';
import { Usuario } from './api';
import { Ruta } from './mockData';
type AppState = {
    token: string;
    usuario: Usuario;
    rutaSeleccionada: Ruta | null;
    setRutaSeleccionada: (r: Ruta | null) => void;
    logout: () => void;
};
export declare function AppProvider({ token, usuario, onLogout, children, }: {
    token: string;
    usuario: Usuario;
    onLogout: () => void;
    children: ReactNode;
}): any;
export declare function useApp(): AppState;
export {};
