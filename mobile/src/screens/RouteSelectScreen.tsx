import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RUTAS, Ruta } from '../mockData';
import { useApp } from '../AppContext';
import { colors, radius } from '../theme';

export default function RouteSelectScreen({ navigation }: any) {
  const { setRutaSeleccionada } = useApp();
  const [sel, setSel] = useState<Ruta | null>(null);

  function verMapa() {
    if (!sel) return;
    setRutaSeleccionada(sel);
    navigation.navigate('Mapa');
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: sel ? 110 : 30 }}>
        <Text style={styles.step}>PASO 1 DE 1</Text>
        <Text style={styles.title}>¿Qué ruta vas a tomar?</Text>
        <Text style={styles.subtitle}>Selecciona tu línea para ver el mapa en tiempo real</Text>

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
  step: { color: colors.yellow, fontWeight: '800', fontSize: 13, letterSpacing: 1 },
  title: { color: colors.white, fontSize: 30, fontWeight: '900', marginTop: 6, letterSpacing: -0.5 },
  subtitle: { color: colors.textMutedLight, fontSize: 15, marginTop: 6, marginBottom: 18 },
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
