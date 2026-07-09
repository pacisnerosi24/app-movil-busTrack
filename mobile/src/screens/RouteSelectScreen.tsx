import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RUTAS, Ruta } from '../mockData';
import { useApp } from '../AppContext';
import { colors, radius } from '../theme';

export default function RouteSelectScreen({ navigation }: any) {
  const { setRutaSeleccionada, userLoc, ubicStatus, seguimiento, esConductor, usuario, iniciarSeguimiento, logout } = useApp();
  const [sel, setSel] = useState<Ruta | null>(null);

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

  function verMapa() {
    if (!sel) return;
    setRutaSeleccionada(sel);
    navigation.navigate('Mapa');
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: sel ? 110 : 30 }}>
        {/* Barra de usuario + cerrar sesión */}
        <View style={styles.userBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.hola}>Hola,</Text>
            <Text style={styles.email} numberOfLines={1}>{usuario.email}</Text>
          </View>
          <TouchableOpacity style={styles.salir} onPress={confirmarSalir} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={18} color={colors.textLight} />
            <Text style={styles.salirTxt}>Salir</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rolRow}>
          <Text style={styles.step}>PASO 1 DE 1</Text>
          <View style={[styles.rolBadge, { backgroundColor: esConductor ? colors.orange : colors.blue }]}>
            <Ionicons name={esConductor ? 'bus' : 'person'} size={12} color="#fff" />
            <Text style={styles.rolTxt}>{esConductor ? 'CONDUCTOR' : 'PASAJERO'}</Text>
          </View>
        </View>
        <Text style={styles.title}>{esConductor ? '¿Qué ruta vas a conducir?' : '¿Qué ruta vas a tomar?'}</Text>
        <Text style={styles.subtitle}>
          {esConductor
            ? 'Selecciona tu línea: tu GPS será el bus que verán los pasajeros'
            : 'Selecciona tu línea para ver el mapa en tiempo real'}
        </Text>

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

        {RUTAS.map(r => {
          const activa = sel?.id === r.id;
          return (
            <TouchableOpacity
              key={r.id}
              activeOpacity={0.85}
              onPress={() => setSel(activa ? null : r)}
              style={[styles.card, activa && { borderColor: r.color }]}
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
                {activa
                  ? <View style={[styles.check, { backgroundColor: r.color }]}><Ionicons name="checkmark" size={16} color="#fff" /></View>
                  : <Ionicons name="chevron-forward" size={20} color={colors.textMutedLight} />}
              </View>

              <View style={styles.metaRow}>
                <Meta icon="time-outline" text={`${r.minutos} min`} strong color={activa ? r.color : undefined} />
                <View style={styles.sep} />
                <Meta icon="location-outline" text={`${r.paradas} paradas`} />
                <View style={styles.sep} />
                <Text style={styles.metaTxt}>{r.tipoBus}</Text>
              </View>

              {activa && (
                <View style={styles.progressBlock}>
                  <View style={styles.progressLine}>
                    <View style={[styles.dot, { backgroundColor: colors.green }]} />
                    <View style={[styles.bar, { backgroundColor: r.color }]} />
                    <View style={[styles.dot, { backgroundColor: colors.red }]} />
                  </View>
                  <View style={styles.progressLabels}>
                    <Text style={[styles.progressTxt, { color: colors.green }]}>{r.origen}</Text>
                    <Text style={[styles.progressTxt, { color: colors.red }]}>{r.destino}</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={styles.addBtn} activeOpacity={0.7}>
          <Ionicons name="add-circle-outline" size={20} color={colors.textMutedLight} />
          <Text style={styles.addTxt}>Agregar ruta personalizada</Text>
        </TouchableOpacity>
      </ScrollView>

      {sel && (
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.verBtn, { backgroundColor: sel.color }]} onPress={verMapa} activeOpacity={0.9}>
            <Text style={styles.verTxt}>Ver mapa — {sel.nombre}</Text>
          </TouchableOpacity>
        </View>
      )}
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
  userBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  hola: { color: colors.textMutedLight, fontSize: 13 },
  email: { color: colors.white, fontSize: 16, fontWeight: '700' },
  salir: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.navyCard, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9 },
  salirTxt: { color: colors.textLight, fontWeight: '700', fontSize: 13 },
  rolRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rolBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  rolTxt: { color: '#fff', fontWeight: '800', fontSize: 11, letterSpacing: 0.5 },
  step: { color: colors.yellow, fontWeight: '800', fontSize: 13, letterSpacing: 1 },
  title: { color: colors.white, fontSize: 30, fontWeight: '900', marginTop: 6, letterSpacing: -0.5 },
  subtitle: { color: colors.textMutedLight, fontSize: 15, marginTop: 6, marginBottom: 12 },
  ubic: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.navyCard, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 11, marginBottom: 16 },
  ubicTxt: { color: colors.textLight, fontSize: 13, fontWeight: '600', flex: 1 },
  ubicRetry: { color: colors.primaryLight, fontWeight: '800', fontSize: 13 },
  liveDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.green },
  card: { backgroundColor: colors.navyCard, borderRadius: radius.lg, padding: 16, marginBottom: 14, borderWidth: 1.5, borderColor: 'transparent' },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  icon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name: { color: colors.white, fontSize: 19, fontWeight: '800' },
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8 },
  badgeTxt: { fontSize: 12, fontWeight: '700' },
  route: { color: colors.textMutedLight, fontSize: 14, marginTop: 3 },
  check: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 10 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaTxt: { color: colors.textMutedLight, fontSize: 13 },
  sep: { width: 1, height: 14, backgroundColor: colors.navyBorder },
  progressBlock: { marginTop: 16, borderTopWidth: 1, borderTopColor: colors.navyBorder, paddingTop: 16 },
  progressLine: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 11, height: 11, borderRadius: 6 },
  bar: { flex: 1, height: 4, borderRadius: 2, marginHorizontal: 4 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  progressTxt: { fontSize: 13, fontWeight: '700' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: colors.navyBorder, borderStyle: 'dashed', borderRadius: radius.lg, paddingVertical: 18, marginTop: 4 },
  addTxt: { color: colors.textMutedLight, fontSize: 15, fontWeight: '600' },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: colors.navy, borderTopWidth: 1, borderTopColor: colors.navyBorder },
  verBtn: { borderRadius: radius.md, paddingVertical: 17, alignItems: 'center' },
  verTxt: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
