import { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import * as Location from 'expo-location';
import { Usuario } from './api';
import { Ruta } from './mockData';
import { getApiBase, initApiBase, setApiBase } from './config';

export type Coords = { lat: number; lng: number };
export type UbicStatus = 'idle' | 'loading' | 'ok' | 'denied' | 'error';

type AppState = {
  token: string;
  usuario: Usuario;
  esConductor: boolean;
  rutaSeleccionada: Ruta | null;
  setRutaSeleccionada: (r: Ruta | null) => void;
  // Ubicación en vivo del teléfono (solo local; el conductor la retransmite
  // como bus desde el mapa, el pasajero solo la usa para ubicarse).
  userLoc: Coords | null;
  ubicStatus: UbicStatus;
  seguimiento: boolean;
  iniciarSeguimiento: () => Promise<void>;
  logout: () => void;
  // URL del backend en uso (autodetectada o manual desde Ajustes).
  apiBase: string;
  updateApiBase: (url: string) => void;
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
  const [userLoc, setUserLoc] = useState<Coords | null>(null);
  const [ubicStatus, setUbicStatus] = useState<UbicStatus>('idle');
  const [seguimiento, setSeguimiento] = useState(false);
  const [apiBase, setApiBaseState] = useState<string>(getApiBase());
  const subRef = useRef<Location.LocationSubscription | null>(null);

  // Al arrancar: si hay una URL de backend guardada (ej. ngrok), la aplica.
  useEffect(() => { initApiBase().then(setApiBaseState); }, []);

  // Cambia la URL del backend en vivo (llamada desde Ajustes).
  const updateApiBase = useCallback((url: string) => {
    setApiBase(url);
    setApiBaseState(getApiBase());
  }, []);

  // El administrador también puede actuar como conductor para pruebas.
  const esConductor = usuario.rol === 'conductor' || usuario.rol === 'administrador';

  // Rastrea el GPS real del teléfono en vivo (NO lo guarda: el guardado como
  // bus lo decide el mapa según el rol). Ambos roles lo usan para ubicarse.
  const iniciarSeguimiento = useCallback(async () => {
    if (subRef.current) return;
    try {
      setUbicStatus('loading');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setUbicStatus('denied'); return; }
      setUbicStatus('ok');
      setSeguimiento(true);

      // 1) Posición INMEDIATA para que el marcador aparezca ya mismo.
      //    watchPositionAsync puede tardar en dar el primer punto (o esperar
      //    a que te muevas), así que primero pedimos una lectura directa.
      try {
        const ultima = await Location.getLastKnownPositionAsync();
        if (ultima) setUserLoc({ lat: ultima.coords.latitude, lng: ultima.coords.longitude });
        const actual = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setUserLoc({ lat: actual.coords.latitude, lng: actual.coords.longitude });
      } catch {
        // Si falla la lectura directa, el watch de abajo igual actualizará.
      }

      // 2) Rastreo en vivo (se actualiza mientras te mueves).
      subRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 5 },
        (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      );
    } catch {
      setUbicStatus('error');
    }
  }, []);

  useEffect(() => () => { subRef.current?.remove(); subRef.current = null; }, []);

  return (
    <Ctx.Provider value={{
      token, usuario, esConductor, rutaSeleccionada, setRutaSeleccionada,
      userLoc, ubicStatus, seguimiento, iniciarSeguimiento, logout: onLogout,
      apiBase, updateApiBase,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp debe usarse dentro de <AppProvider>');
  return v;
}
