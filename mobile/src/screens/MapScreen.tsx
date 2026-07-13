import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { enviarUbicacion } from '../api';
import { buildMapHtml, Parada } from '../mapHtml';
import { getRoadRoute, getTraficoAhora, RoadRoute, Trafico, metrosEntre, distanciasAcumuladas, proyectar } from '../routing';
import { useApp } from '../AppContext';
import { colors, radius } from '../theme';

// Formatea metros a "850 m" o "1.2 km".
function fmtDist(m: number): string {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
}

export default function MapScreen({ navigation }: any) {
  const { token, rutaSeleccionada, userLoc, ubicStatus, esConductor, apiBase } = useApp();
  const ruta = rutaSeleccionada;
  const modo: 'conductor' | 'pasajero' = esConductor ? 'conductor' : 'pasajero';
  const [transmisiones, setTransmisiones] = useState(0);
  const txBusy = useRef(false);

  // Sentido del recorrido: ida (origen→destino) o vuelta (destino→origen).
  // Si la ruta no define pathVuelta, la vuelta usa la ida invertida.
  const [sentido, setSentido] = useState<'ida' | 'vuelta'>('ida');
  const pathBase = useMemo<[number, number][]>(() => {
    if (!ruta) return [];
    if (sentido === 'ida') return ruta.path;
    return ruta.pathVuelta ?? [...ruta.path].reverse();
  }, [ruta?.id, sentido]);
  const nombresBase = useMemo<string[]>(() => {
    if (!ruta) return [];
    if (sentido === 'ida') return ruta.nombresParadas;
    return ruta.nombresParadasVuelta ?? [...ruta.nombresParadas].reverse();
  }, [ruta?.id, sentido]);
  // Hacia dónde va el bus en el sentido actual (para mostrarlo claro al usuario).
  const destinoActual = sentido === 'ida' ? (ruta?.destino ?? '') : (ruta?.origen ?? '');

  // Ancla la ruta UNA vez a la primera ubicación conocida (no en cada
  // movimiento) para no recargar el mapa mientras te mueves.
  const [anchor, setAnchor] = useState<{ lat: number; lng: number } | null>(null);
  useEffect(() => { if (!anchor && userLoc) setAnchor(userLoc); }, [userLoc, anchor]);

  // Las rutas REALES no dependen de tu ubicación (van fijas en Quito).
  // Esperamos a tener ubicación (o a que se niegue) antes de trazar el mapa.
  const ubicacionLista = !!ruta?.real || anchor !== null || ubicStatus === 'denied' || ubicStatus === 'error';

  // Traslada el trazado para que su centro coincida con tu ubicación
  // (excepto las rutas reales, que conservan sus coordenadas verdaderas).
  const anchoredPath = useMemo(() => {
    if (!ruta) return [] as [number, number][];
    if (ruta.real || !anchor) return pathBase;
    const n = pathBase.length;
    const cLat = pathBase.reduce((s, p) => s + p[0], 0) / n;
    const cLng = pathBase.reduce((s, p) => s + p[1], 0) / n;
    const dLat = anchor.lat - cLat;
    const dLng = anchor.lng - cLng;
    return pathBase.map(([la, ln]) => [la + dLat, ln + dLng] as [number, number]);
  }, [ruta?.id, anchor, pathBase]);

  const webRef = useRef<WebView>(null);
  const [road, setRoad] = useState<RoadRoute | null>(null);
  const [trafico] = useState<Trafico>(() => getTraficoAhora());
  const [eta, setEta] = useState(ruta?.minutos ?? 0);
  const [frac, setFrac] = useState(0);
  const [prox, setProx] = useState(ruta?.origen ?? '');
  const [moviendo, setMoviendo] = useState(false);
  const [siguiendo, setSiguiendo] = useState(true);
  const [etaMe, setEtaMe] = useState<number | null>(null); // min hasta que el bus llega a ti
  const [distMe, setDistMe] = useState<number | null>(null); // metros del bus a ti

  useEffect(() => {
    let vivo = true;
    setRoad(null);
    if (ruta && ubicacionLista && anchoredPath.length) {
      getRoadRoute(anchoredPath).then(r => { if (vivo) setRoad(r); });
    }
    return () => { vivo = false; };
  }, [ruta?.id, anchoredPath, ubicacionLista]);

  // GPS en vivo según el rol:
  //  - Pasajero: mueve solo su punto "Tú" (no se guarda como bus).
  //  - Conductor: su GPS ES el bus -> lo mueve y lo transmite al backend.
  useEffect(() => {
    if (!road || !userLoc) return;
    if (esConductor) {
      webRef.current?.injectJavaScript(`window.__setBus && window.__setBus(${userLoc.lat}, ${userLoc.lng}); true;`);
      if (!txBusy.current) {
        txBusy.current = true;
        enviarUbicacion(token, ruta!.idBus, userLoc.lat, userLoc.lng)
          .then(() => setTransmisiones(n => n + 1))
          .catch(() => {})
          .finally(() => { txBusy.current = false; });
      }
    } else {
      webRef.current?.injectJavaScript(`window.__setUser && window.__setUser(${userLoc.lat}, ${userLoc.lng}); true;`);
    }
  }, [userLoc?.lat, userLoc?.lng, road, esConductor]);

  // ETA total con tráfico: duración real (o mock) × factor de tráfico.
  const etaTotal = useMemo(() => {
    const base = road?.snapped && road.durationSec ? road.durationSec / 60 : (ruta?.minutos ?? 0);
    return Math.max(1, Math.round(base * trafico.factor));
  }, [road, trafico, ruta?.minutos]);

  const paradas: Parada[] = useMemo(
    () => (ruta ? anchoredPath.map((pos, i) => ({ pos, nombre: nombresBase[i] })) : []),
    [ruta?.id, anchoredPath, nombresBase],
  );

  // Métricas de la ruta y proyección del pasajero (para el ETA hacia él).
  const metrics = useMemo(() => distanciasAcumuladas(road?.coords ?? []), [road]);
  const speedMps = road && road.durationSec > 0 ? road.distanceM / road.durationSec : 5;
  const proj = useMemo(
    () => (road && userLoc && !esConductor ? proyectar(road.coords, metrics.cum, [userLoc.lat, userLoc.lng]) : null),
    [road, userLoc?.lat, userLoc?.lng, metrics, esConductor],
  );
  // ¿El pasajero está sobre esta ruta? (a menos de 1.5 km)
  const cercaDeRuta = !!proj && proj.crossM < 1500;

  // Dibuja "Tu parada" (punto de la ruta donde te recoge el bus).
  useEffect(() => {
    if (road && proj && cercaDeRuta) {
      const [la, ln] = road.coords[proj.idx];
      webRef.current?.injectJavaScript(`window.__setStop && window.__setStop(${la}, ${ln}); true;`);
    }
  }, [proj, road, cercaDeRuta]);

  // Al TERMINAR de cargar el mapa, pinta tu ubicación (y tu parada) de una vez.
  // Antes se inyectaba al cambiar userLoc, pero si el punto ya estaba listo
  // esa orden se perdía por llegar antes de que el mapa existiera → no aparecías.
  function onMapaListo() {
    if (esConductor) {
      if (userLoc) webRef.current?.injectJavaScript(`window.__setBus && window.__setBus(${userLoc.lat}, ${userLoc.lng}); true;`);
    } else if (userLoc) {
      // Muestra tu punto y aleja hasta ver tu ubicación + toda la ruta.
      webRef.current?.injectJavaScript(`window.__setUser && window.__setUser(${userLoc.lat}, ${userLoc.lng}); window.__fitAll && window.__fitAll(${userLoc.lat}, ${userLoc.lng}); true;`);
    } else {
      webRef.current?.injectJavaScript(`window.__fitAll && window.__fitAll(); true;`);
    }
    if (road && proj && cercaDeRuta) {
      const [la, ln] = road.coords[proj.idx];
      webRef.current?.injectJavaScript(`window.__setStop && window.__setStop(${la}, ${ln}); true;`);
    }
  }

  // El HTML se genera una vez por ruta (marcador inicial en el ancla; el
  // punto "Tú" luego se mueve en vivo con window.__setUser).
  const html = useMemo(
    () => (road && ruta
      ? buildMapHtml(apiBase, ruta.idBus, ruta.color, road.coords, paradas, etaTotal, 1, (esConductor || ruta.real) ? null : anchor, modo)
      : ''),
    [road, ruta?.id, etaTotal, paradas, anchor, modo, apiBase],
  );

  if (!ruta) {
    return (
      <View style={styles.empty}>
        <MaterialCommunityIcons name="bus-alert" size={54} color={colors.textMutedDark} />
        <Text style={styles.emptyTxt}>No has seleccionado una ruta</Text>
        <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('SeleccionRuta')}>
          <Text style={styles.emptyBtnTxt}>Elegir ruta</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function recentrar() {
    webRef.current?.injectJavaScript(`window.__recenter && window.__recenter(); true;`);
    setSiguiendo(true);
  }
  // Centra el mapa en TU ubicación (y reafirma el punto por si el mapa recargó).
  function centrarEnMi() {
    if (!userLoc) return;
    webRef.current?.injectJavaScript(
      `window.__setUser && window.__setUser(${userLoc.lat}, ${userLoc.lng});` +
      `window.__recenterMe && window.__recenterMe(); true;`,
    );
    setSiguiendo(false);
  }
  function onMessage(raw: string) {
    try {
      const m = JSON.parse(raw);
      if (m.type === 'progress') {
        setEta(m.eta); setFrac(m.frac); setProx(m.prox);
        setMoviendo(m.frac > 0 && m.frac < 1);
        // ETA y distancia del bus hacia el pasajero.
        if (proj && metrics.total > 0 && userLoc) {
          const busAlong = m.frac * metrics.total;
          // Distancia que le falta al bus para llegar a tu parada (con vuelta si ya pasó).
          const rem = (((proj.alongM - busAlong) % metrics.total) + metrics.total) % metrics.total;
          setEtaMe(Math.max(0, Math.ceil(rem / speedMps / 60)));
          setDistMe(metrosEntre([m.lat, m.lng], [userLoc.lat, userLoc.lng]));
        }
      } else if (m.type === 'follow') {
        setSiguiendo(m.following);
      }
    } catch {}
  }

  const llego = frac >= 1;

  if (!ubicacionLista) {
    return (
      <View style={styles.loadingFull}>
        <ActivityIndicator size="large" color={ruta.color} />
        <Text style={styles.loadingTxt}>Ubicando tu teléfono…</Text>
      </View>
    );
  }

  if (!road) {
    return (
      <View style={styles.loadingFull}>
        <ActivityIndicator size="large" color={ruta.color} />
        <Text style={styles.loadingTxt}>Trazando ruta por las calles…</Text>
        <TouchableOpacity style={styles.cancelar} onPress={() => navigation.navigate('SeleccionRuta')}>
          <Text style={styles.cancelarTxt}>Cambiar ruta</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <WebView
        key={`${ruta.id}-${sentido}-${road.snapped}-${anchor ? 'u' : 'd'}`}
        ref={webRef}
        style={StyleSheet.absoluteFill}
        originWhitelist={['*']}
        source={{ html }}
        onMessage={(e) => onMessage(e.nativeEvent.data)}
        onLoadEnd={onMapaListo}
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
      />

      <SafeAreaView edges={['top']} style={styles.topOverlay} pointerEvents="box-none">
        <View style={styles.topRow}>
          <View style={styles.pill}>
            <Ionicons name="bus" size={14} color="#fff" />
            {esConductor ? (
              <Text style={styles.pillTxt} numberOfLines={1}>Conduces a {destinoActual}</Text>
            ) : (
              <>
                <Text style={styles.pillTxt} numberOfLines={1}>{llego ? `Llegó a ${destinoActual}` : moviendo ? `En camino a ${destinoActual}` : `Saliendo a ${destinoActual}`}</Text>
                <View style={[styles.pillDot, { backgroundColor: moviendo ? colors.green : llego ? colors.orange : colors.textMutedDark }]} />
              </>
            )}
          </View>

          {/* Selector por DESTINO (más intuitivo que "ida/vuelta") */}
          <View style={styles.segment}>
            <TouchableOpacity style={[styles.segBtn, sentido === 'ida' && { backgroundColor: ruta.color }]} onPress={() => setSentido('ida')} activeOpacity={0.85}>
              <Ionicons name="arrow-forward" size={12} color={sentido === 'ida' ? '#fff' : colors.textMutedDark} />
              <Text style={[styles.segTxt, sentido === 'ida' && styles.segTxtActive]} numberOfLines={1}>{ruta.destino}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.segBtn, sentido === 'vuelta' && { backgroundColor: ruta.color }]} onPress={() => setSentido('vuelta')} activeOpacity={0.85}>
              <Ionicons name="arrow-forward" size={12} color={sentido === 'vuelta' ? '#fff' : colors.textMutedDark} />
              <Text style={[styles.segTxt, sentido === 'vuelta' && styles.segTxtActive]} numberOfLines={1}>{ruta.origen}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {!road.snapped && (
          <View style={styles.warn}><Text style={styles.warnTxt}>Ruta aproximada (sin conexión al ruteo)</Text></View>
        )}
      </SafeAreaView>

      {/* Botones flotantes (estilo Uber) */}
      <View style={styles.fabCol} pointerEvents="box-none">
        {!esConductor && userLoc && (
          <TouchableOpacity style={styles.fab} onPress={centrarEnMi} activeOpacity={0.85}>
            <MaterialCommunityIcons name="crosshairs-gps" size={22} color={colors.blue} />
            <Text style={[styles.fabTxt, { color: colors.blue }]}>Mi ubicación</Text>
          </TouchableOpacity>
        )}
        {!siguiendo && (
          <TouchableOpacity style={[styles.fab, { borderColor: ruta.color, borderWidth: 1.5 }]} onPress={recentrar} activeOpacity={0.85}>
            <MaterialCommunityIcons name="bus" size={22} color={ruta.color} />
            <Text style={[styles.fabTxt, { color: ruta.color }]}>Seguir bus</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardDot, { backgroundColor: ruta.color }]} />
            <Text style={styles.cardRoute} numberOfLines={1}>{ruta.nombre} — {ruta.etiqueta}</Text>
            <TouchableOpacity style={styles.cambiar} onPress={() => navigation.navigate('SeleccionRuta')}>
              <Ionicons name="arrow-back" size={13} color={ruta.color} />
              <Text style={[styles.cambiarTxt, { color: ruta.color }]}>Cambiar</Text>
            </TouchableOpacity>
          </View>

          {esConductor ? (
            <>
              <Text style={styles.etaLabel}>Transmitiendo tu GPS como el bus</Text>
              <Text style={[styles.eta, { color: colors.red }]}>En vivo</Text>
              <View style={styles.proxRow}>
                <Ionicons name="cloud-upload" size={14} color={colors.green} />
                <Text style={styles.proxTxt} numberOfLines={1}>{transmisiones} ubicaciones enviadas</Text>
              </View>
            </>
          ) : cercaDeRuta ? (
            <>
              <Text style={styles.etaLabel}>Tu bus llega en:</Text>
              <Text style={styles.eta}>{etaMe ?? '—'} min</Text>
              <View style={styles.proxRow}>
                <Ionicons name="navigate" size={13} color={ruta.color} />
                <Text style={styles.proxTxt} numberOfLines={1}>
                  El bus está a {distMe != null ? fmtDist(distMe) : '—'} de ti
                </Text>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.etaLabel}>Recorrido de la ruta</Text>
              <Text style={styles.eta}>{eta} min</Text>
              <View style={styles.proxRow}>
                <Ionicons name="information-circle-outline" size={13} color={colors.textMutedDark} />
                <Text style={styles.proxTxt} numberOfLines={1}>
                  {ruta.real ? 'Ruta real de Quito — no estás en esa zona' : 'No estás sobre esta ruta'}
                </Text>
              </View>
            </>
          )}
        </View>

        {esConductor ? (
          <View style={[styles.busBtn, { backgroundColor: colors.red }]}>
            <MaterialCommunityIcons name="broadcast" size={28} color="#fff" />
            <Text style={styles.busBtnTxt}>LIVE</Text>
          </View>
        ) : (
          <View style={[styles.busBtn, { backgroundColor: ruta.color }]}>
            <MaterialCommunityIcons name="bus" size={30} color="#fff" />
            <Text style={styles.busBtnTxt}>En ruta</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.lightBg },
  loadingFull: { flex: 1, backgroundColor: colors.lightBg, alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingTxt: { color: colors.textMutedDark, fontSize: 15, fontWeight: '600' },
  cancelar: { marginTop: 8, paddingHorizontal: 18, paddingVertical: 10 },
  cancelarTxt: { color: colors.textMutedDark, fontWeight: '700' },
  topOverlay: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 16 },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 8 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.textDark, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999 },
  pillDot: { width: 9, height: 9, borderRadius: 5 },
  pillTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },
  segment: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 999, padding: 3, gap: 2, shadowColor: '#1B2B4B', shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 5 },
  segBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 13, paddingVertical: 7, borderRadius: 999 },
  segTxt: { fontWeight: '800', fontSize: 12.5, color: colors.textMutedDark },
  segTxtActive: { color: '#fff' },
  chips: { gap: 8, alignItems: 'flex-end' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.textDark, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 },
  chipTxt: { color: '#fff', fontWeight: '700', fontSize: 12 },
  warn: { alignSelf: 'flex-start', backgroundColor: colors.orange, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, marginTop: 8 },
  warnTxt: { color: '#fff', fontSize: 11, fontWeight: '700' },
  fabCol: { position: 'absolute', right: 16, bottom: 215, alignItems: 'flex-end', gap: 10 },
  fab: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 11, borderRadius: 999, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  fabTxt: { fontWeight: '800', fontSize: 13 },
  card: { position: 'absolute', left: 14, right: 14, bottom: 16, backgroundColor: '#fff', borderRadius: radius.lg, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  cardDot: { width: 9, height: 9, borderRadius: 5 },
  cardRoute: { color: colors.textDark, fontWeight: '800', fontSize: 15, flex: 1 },
  cambiar: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.lightBg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  cambiarTxt: { fontWeight: '800', fontSize: 12 },
  etaLabel: { color: colors.textMutedDark, fontSize: 14, marginTop: 8 },
  eta: { color: colors.green, fontSize: 32, fontWeight: '900', marginTop: 2 },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: colors.lightBg, marginTop: 12, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
  proxRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  proxTxt: { color: colors.textMutedDark, fontSize: 13, flex: 1 },
  busBtn: { width: 78, height: 78, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  busBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 12, marginTop: 2 },
  empty: { flex: 1, backgroundColor: colors.lightBg, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 30 },
  emptyTxt: { color: colors.textMutedDark, fontSize: 16, fontWeight: '600' },
  emptyBtn: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: radius.md },
  emptyBtnTxt: { color: colors.white, fontWeight: '800', fontSize: 15 },
});
