import { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RUTAS, Ruta } from '../mockData';
import { useApp } from '../AppContext';
import { colors, radius } from '../theme';

// Quita tildes y pasa a minúsculas para buscar sin importar acentos.
const DIACRITICOS = new RegExp('[\\u0300-\\u036f]', 'g');
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(DIACRITICOS, '');

// Hash estable del id → una "fase" fija por ruta (para que no todas lleguen a la vez).
function hashId(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

// Minutos hasta el próximo bus, según la frecuencia de la línea y la hora real.
// Simulación: no hay horarios oficiales; en producción vendría del GPS en vivo.
function proximoBusMin(id: string, frecuencia: number, ahora: Date): number {
  const minutosDia = ahora.getHours() * 60 + ahora.getMinutes() + ahora.getSeconds() / 60;
  const fase = hashId(id) % frecuencia;
  const restante = frecuencia - ((minutosDia + fase) % frecuencia);
  return Math.max(1, Math.ceil(restante));
}

export default function RouteSelectScreen({ navigation }: any) {
  const { setRutaSeleccionada, userLoc, ubicStatus, esConductor, usuario, iniciarSeguimiento, logout } = useApp();
  const [busqueda, setBusqueda] = useState('');

  // Reloj que avanza para recalcular la cuenta regresiva del próximo bus.
  const [ahora, setAhora] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setAhora(new Date()), 15000);
    return () => clearInterval(t);
  }, []);

  // Filtra por nombre, etiqueta, origen, destino o tipo de bus.
  const rutasFiltradas = useMemo(() => {
    const q = norm(busqueda.trim());
    if (!q) return RUTAS;
    return RUTAS.filter(r => norm(`${r.nombre} ${r.etiqueta} ${r.origen} ${r.destino} ${r.tipoBus}`).includes(q));
  }, [busqueda]);

  function confirmarSalir() {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: logout },
    ]);
  }

  // Inicia el seguimiento del GPS del usuario al entrar (base para los buses).
  useEffect(() => {
    if (ubicStatus === 'idle') iniciarSeguimiento();
  }, [ubicStatus]);

  // Tocar una ruta entra DIRECTO al mapa (sin paso intermedio de confirmación).
  function elegirRuta(r: Ruta) {
    setRutaSeleccionada(r);
    navigation.navigate('Mapa');
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 30 }}>
        {/* Barra de usuario + cerrar sesión */}
        <View style={styles.userBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.hola}>Hola,</Text>
            <Text style={styles.email} numberOfLines={1}>{usuario.email}</Text>
          </View>
          <View style={[styles.rolBadge, { backgroundColor: esConductor ? colors.orange : colors.blue }]}>
            <Ionicons name={esConductor ? 'bus' : 'person'} size={12} color="#fff" />
            <Text style={styles.rolTxt}>{esConductor ? 'CONDUCTOR' : 'PASAJERO'}</Text>
          </View>
          <TouchableOpacity style={styles.salir} onPress={confirmarSalir} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={18} color={colors.textLight} />
            <Text style={styles.salirTxt}>Salir</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>{esConductor ? '¿Qué ruta vas a conducir?' : '¿Qué ruta vas a tomar?'}</Text>
        <Text style={styles.subtitle}>
          {esConductor
            ? 'Toca tu línea: tu GPS será el bus que verán los pasajeros'
            : 'Toca tu línea para ver el mapa en tiempo real'}
        </Text>

        {/* Buscador de rutas / buses */}
        <View style={styles.search}>
          <Ionicons name="search" size={18} color={colors.textMutedLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar ruta, bus o destino…"
            placeholderTextColor={colors.textMutedLight}
            value={busqueda}
            onChangeText={setBusqueda}
            returnKeyType="search"
            autoCorrect={false}
          />
          {busqueda.length > 0 && (
            <TouchableOpacity onPress={() => setBusqueda('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textMutedLight} />
            </TouchableOpacity>
          )}
        </View>

        {/* Estado de la ubicación del teléfono */}
        <View style={styles.ubic}>
          {(ubicStatus === 'loading' || (ubicStatus === 'ok' && !userLoc)) && (
            <><ActivityIndicator size="small" color={colors.primaryLight} />
              <Text style={styles.ubicTxt}>Detectando tu ubicación…</Text></>
          )}
          {ubicStatus === 'ok' && userLoc && (
            <>
              <Ionicons name="navigate" size={16} color={colors.green} />
              <Text style={styles.ubicTxt}>GPS en vivo · tu ubicación está activa</Text>
              <View style={styles.liveDot} />
            </>
          )}
          {(ubicStatus === 'denied' || ubicStatus === 'error') && (
            <>
              <Ionicons name="location-outline" size={16} color={colors.orange} />
              <Text style={styles.ubicTxt}>Sin ubicación · usando zona por defecto</Text>
              <TouchableOpacity onPress={iniciarSeguimiento} hitSlop={8}>
                <Text style={styles.ubicRetry}>Reintentar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {rutasFiltradas.length === 0 && (
          <View style={styles.vacio}>
            <Ionicons name="bus-outline" size={40} color={colors.textMutedLight} />
            <Text style={styles.vacioTxt}>Sin resultados para “{busqueda.trim()}”</Text>
            <TouchableOpacity onPress={() => setBusqueda('')} activeOpacity={0.8}>
              <Text style={styles.ubicRetry}>Limpiar búsqueda</Text>
            </TouchableOpacity>
          </View>
        )}

        {rutasFiltradas.map(r => (
          <TouchableOpacity
            key={r.id}
            activeOpacity={0.85}
            onPress={() => elegirRuta(r)}
            style={styles.card}
          >
            <View style={styles.cardTop}>
              <View style={[styles.icon, { backgroundColor: r.color }]}>
                <MaterialCommunityIcons name="bus" size={24} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{r.nombre}</Text>
                  <View style={[styles.badge, { backgroundColor: r.color + '22' }]}>
                    <Text style={[styles.badgeTxt, { color: r.color }]}>{r.etiqueta}</Text>
                  </View>
                </View>
                <Text style={styles.route}>{r.origen}  →  {r.destino}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMutedLight} />
            </View>

            {!esConductor && (
              <View style={[styles.prox, { backgroundColor: r.color + '18' }]}>
                <View style={[styles.proxDot, { backgroundColor: r.color }]} />
                <Text style={[styles.proxTxt, { color: r.color }]}>
                  Próximo bus en {proximoBusMin(r.id, r.frecuenciaMin, ahora)} min
                </Text>
                <Text style={styles.proxFrec}>· cada {r.frecuenciaMin} min</Text>
              </View>
            )}

            <View style={styles.metaRow}>
              <Meta icon="time-outline" text={`${r.minutos} min recorrido`} />
              <View style={styles.sep} />
              <Meta icon="location-outline" text={`${r.paradas} paradas`} />
              <View style={styles.sep} />
              <Text style={styles.metaTxt} numberOfLines={1}>{r.tipoBus}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function Meta({ icon, text, strong, color }: { icon: any; text: string; strong?: boolean; color?: string }) {
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={15} color={color ?? colors.textMutedLight} />
      <Text style={[styles.metaTxt, strong && { fontWeight: '800', color: color ?? colors.textLight }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navy },
  userBar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  hola: { color: colors.textMutedLight, fontSize: 13 },
  email: { color: colors.textLight, fontSize: 16, fontWeight: '700' },
  salir: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.navyCard, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: colors.navyBorder },
  salirTxt: { color: colors.textLight, fontWeight: '700', fontSize: 13 },
  rolBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  rolTxt: { color: '#fff', fontWeight: '800', fontSize: 11, letterSpacing: 0.5 },
  title: { color: colors.textLight, fontSize: 30, fontWeight: '900', marginTop: 2, letterSpacing: -0.5 },
  subtitle: { color: colors.textMutedLight, fontSize: 15, marginTop: 6, marginBottom: 12 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: colors.navyCard, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 4, marginBottom: 12, borderWidth: 1, borderColor: colors.navyBorder },
  searchInput: { flex: 1, color: colors.textLight, fontSize: 15, fontWeight: '500', paddingVertical: 10 },
  vacio: { alignItems: 'center', gap: 10, paddingVertical: 40 },
  vacioTxt: { color: colors.textMutedLight, fontSize: 15, fontWeight: '600' },
  ubic: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.navyCard, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 11, marginBottom: 16, borderWidth: 1, borderColor: colors.navyBorder },
  ubicTxt: { color: colors.textLight, fontSize: 13, fontWeight: '600', flex: 1 },
  ubicRetry: { color: colors.primaryLight, fontWeight: '800', fontSize: 13 },
  liveDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.green },
  card: { backgroundColor: colors.navyCard, borderRadius: radius.lg, padding: 16, marginBottom: 14, borderWidth: 1.5, borderColor: colors.navyBorder, shadowColor: '#1B2B4B', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  icon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name: { color: colors.textLight, fontSize: 19, fontWeight: '800' },
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8 },
  badgeTxt: { fontSize: 12, fontWeight: '700' },
  route: { color: colors.textMutedLight, fontSize: 14, marginTop: 3 },
  prox: { flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'flex-start', marginTop: 12, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  proxDot: { width: 8, height: 8, borderRadius: 4 },
  proxTxt: { fontSize: 15, fontWeight: '800' },
  proxFrec: { color: colors.textMutedLight, fontSize: 13, fontWeight: '600' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 10 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaTxt: { color: colors.textMutedLight, fontSize: 13 },
  sep: { width: 1, height: 14, backgroundColor: colors.navyBorder },
});
