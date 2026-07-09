import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { enviarUbicacion } from '../api';
import { buildMapHtml } from '../mapHtml';
import { useApp } from '../AppContext';
import { colors, radius } from '../theme';

export default function MapScreen({ navigation }: any) {
  const { token, rutaSeleccionada, apiBase } = useApp();
  const [simulando, setSimulando] = useState(false);
  const [wsOk, setWsOk] = useState(false);
  const [enVivo, setEnVivo] = useState(false);
  const posRef = useRef({ lat: -2.170998, lng: -79.922359 });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const ruta = rutaSeleccionada;

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

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

  async function tick() {
    posRef.current.lat += (Math.random() - 0.35) * 0.0009;
    posRef.current.lng += (Math.random() - 0.35) * 0.0009;
    try {
      await enviarUbicacion(token, ruta!.idBus, posRef.current.lat, posRef.current.lng);
    } catch { /* silencioso en la UI del mapa */ }
  }

  function toggleSim() {
    if (simulando) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      setSimulando(false);
    } else {
      setSimulando(true);
      tick();
      timerRef.current = setInterval(tick, 2000);
    }
  }

  function onMessage(raw: string) {
    try {
      const m = JSON.parse(raw);
      if (m.type === 'ws') setWsOk(!!m.connected);
      if (m.type === 'pos') setEnVivo(true);
    } catch {}
  }

  return (
    <View style={styles.root}>
      <WebView
        style={StyleSheet.absoluteFill}
        originWhitelist={['*']}
        source={{ html: buildMapHtml(apiBase, ruta.idBus, ruta.color) }}
        onMessage={(e) => onMessage(e.nativeEvent.data)}
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}><ActivityIndicator size="large" color={ruta.color} /></View>
        )}
      />

      <SafeAreaView edges={['top']} style={styles.topOverlay} pointerEvents="box-none">
        <View style={styles.pill}>
          <View style={[styles.pillDot, { backgroundColor: enVivo ? colors.green : colors.textMutedDark }]} />
          <Text style={styles.pillTxt}>{enVivo ? 'En camino' : wsOk ? 'Esperando GPS...' : 'Conectando...'}</Text>
        </View>
      </SafeAreaView>

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
          <Text style={styles.etaLabel}>Llegara en:</Text>
          <Text style={styles.eta}>{ruta.minutos} min</Text>
          <View style={styles.tag}><Text style={styles.tagTxt}>{ruta.tipoBus}</Text></View>
        </View>

        <TouchableOpacity
          style={[styles.busBtn, { backgroundColor: simulando ? colors.red : ruta.color }]}
          onPress={toggleSim}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name={simulando ? 'stop' : 'bus'} size={30} color="#fff" />
          <Text style={styles.busBtnTxt}>{simulando ? 'Detener' : 'Simular'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.lightBg },
  loading: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.lightBg },
  topOverlay: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 16 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', backgroundColor: colors.navy, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, marginTop: 8 },
  pillDot: { width: 9, height: 9, borderRadius: 5 },
  pillTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },
  card: { position: 'absolute', left: 14, right: 14, bottom: 16, backgroundColor: '#fff', borderRadius: radius.lg, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  cardDot: { width: 9, height: 9, borderRadius: 5 },
  cardRoute: { color: colors.textDark, fontWeight: '800', fontSize: 15, flex: 1 },
  cambiar: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.lightBg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  cambiarTxt: { fontWeight: '800', fontSize: 12 },
  etaLabel: { color: colors.textMutedDark, fontSize: 14, marginTop: 8 },
  eta: { color: colors.green, fontSize: 34, fontWeight: '900', marginTop: 2 },
  tag: { alignSelf: 'flex-start', backgroundColor: colors.orangeSoft, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, marginTop: 8 },
  tagTxt: { color: colors.orange, fontWeight: '700', fontSize: 13 },
  busBtn: { width: 78, height: 78, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  busBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 12, marginTop: 2 },
  empty: { flex: 1, backgroundColor: colors.lightBg, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 30 },
  emptyTxt: { color: colors.textMutedDark, fontSize: 16, fontWeight: '600' },
  emptyBtn: { backgroundColor: colors.yellow, paddingHorizontal: 24, paddingVertical: 14, borderRadius: radius.md },
  emptyBtnTxt: { color: colors.navy, fontWeight: '800', fontSize: 15 },
});
