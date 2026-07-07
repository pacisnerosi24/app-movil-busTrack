import { createContext, useContext, useState, ReactNode } from 'react';
import { Usuario } from './api';
import { Ruta } from './mockData';

type AppState = {
  token: string;
  usuario: Usuario;
  rutaSeleccionada: Ruta | null;
  setRutaSeleccionada: (r: Ruta | null) => void;
  logout: () => void;
};

const Ctx = createContext<AppState | null>(null);

export function AppProvider({
  token, usuario, onLogout, children,
}: {
  token: string;
  usuario: Usuario;
  onLogout: () => void;
  children: ReactNode;
}) {
  const [rutaSeleccionada, setRutaSeleccionada] = useState<Ruta | null>(null);
  return (
    <Ctx.Provider value={{ token, usuario, rutaSeleccionada, setRutaSeleccionada, logout: onLogout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp debe usarse dentro de <AppProvider>');
  return v;
}
