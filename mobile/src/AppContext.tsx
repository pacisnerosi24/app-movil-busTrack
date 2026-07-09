import { createContext, useContext, useState, ReactNode } from 'react';
import { Usuario } from './api';
import { Ruta } from './mockData';
import { getApiBase, setApiBase } from './config';

type AppState = {
  token: string;
  usuario: Usuario;
  rutaSeleccionada: Ruta | null;
  setRutaSeleccionada: (r: Ruta | null) => void;
  apiBase: string;
  updateApiBase: (url: string) => void;
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
  const [apiBase, setApiBaseState] = useState(() => getApiBase());

  function updateApiBase(url: string) {
    setApiBase(url);
    setApiBaseState(url);
  }

  return (
    <Ctx.Provider value={{ token, usuario, rutaSeleccionada, setRutaSeleccionada, apiBase, updateApiBase, logout: onLogout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp debe usarse dentro de <AppProvider>');
  return v;
}
