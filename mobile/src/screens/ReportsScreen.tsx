import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { TIPOS_INCIDENTE, TipoIncidente } from '../mockData';
import { dispararAlerta } from '../api';
import { useApp } from '../AppContext';
import { colors, radius } from '../theme';

const ICONS = {
  alert: (c: string) => <Ionicons name="alert" size={24} color={c} />,
  help: (c: string) => <Ionicons name="help" size={24} color={c} />,
  bus: (c: string) => <MaterialCommunityIcons name="bus" size={24} color={c} />,
};

export default function ReportsScreen() {
  const { token, rutaSeleccionada } = useApp();
  const [sel, setSel] = useState<TipoIncidente | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    if (!sel) return;
    setEnviando(true);
    try {
      const idBus = rutaSeleccionada?.idBus ?? 'BUS-014';
      const r = await dispararAlerta(token, idBus);
      Alert.alert(
        r.esCritica ? '🚨 Alerta enviada' : 'Alerta registrada',
        `${sel.titulo}\n\n${r.mensaje}`,
      );
      setSel(null);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo enviar la alerta');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 30 }}>
        {/* Banner */}
        <View style={styles.banner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Reportar incidente</Text>
            <Text style={styles.bannerSub}>Clasifica el suceso en un solo toque</Text>
          </View>
          <View style={styles.bannerIcon}><Ionicons name="alert" size={30} color="#fff" /></View>
        </View>

        <Text style={styles.section}>Tipo de alerta</Text>

        {TIPOS_INCIDENTE.map(t => {
          const activa = sel?.id === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              activeOpacity={0.85}
              onPress={() => setSel(activa ? null : t)}
              style={[styles.card, activa && { borderColor: t.color, backgroundColor: t.colorSoft }]}
            >
              <View style={[styles.cardIcon, { backgroundColor: t.colorSoft }]}>{ICONS[t.icon](t.color)}</View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{t.titulo}</Text>
                <Text style={styles.cardDesc}>{t.descripcion}</Text>
              </View>
              {activa
                ? <View style={[styles.check, { backgroundColor: t.color }]}><Ionicons name="checkmark" size={16} color="#fff" /></View>
                : <Ionicons name="chevron-forward" size={20} color={colors.textMutedDark} />}
            </TouchableOpacity>
          );
        })}

        {/* Alerta comunitaria */}
        <View style={styles.community}>
          <Text style={styles.communityTitle}>Alerta comunitaria</Text>
          <Text style={styles.communityTxt}>Los pasajeros cercanos verán una advertencia visual en la ruta.</Text>
        </View>

        <TouchableOpacity
          style={[styles.sendBtn, sel ? { backgroundColor: colors.red } : { backgroundColor: '#C3CBD6' }]}
          onPress={enviar}
          disabled={!sel || enviando}
          activeOpacity={0.9}
        >
          {enviando ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendTxt}>Enviar Alerta a la Comunidad</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.lightBg },
  banner: { backgroundColor: colors.navy, borderRadius: radius.lg, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  bannerTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
  bannerSub: { color: colors.textMutedLight, fontSize: 14, marginTop: 4 },
  bannerIcon: { width: 58, height: 58, borderRadius: 16, backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center' },
  section: { color: colors.textDark, fontSize: 19, fontWeight: '800', marginTop: 22, marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: radius.md, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12, borderWidth: 1.5, borderColor: 'transparent' },
  cardIcon: { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { color: colors.textDark, fontSize: 17, fontWeight: '800' },
  cardDesc: { color: colors.textMutedDark, fontSize: 14, marginTop: 2 },
  check: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  community: { backgroundColor: '#fff', borderRadius: radius.md, padding: 18, marginTop: 8 },
  communityTitle: { color: colors.textDark, fontSize: 20, fontWeight: '900' },
  communityTxt: { color: colors.textMutedDark, fontSize: 15, marginTop: 8, lineHeight: 21 },
  sendBtn: { borderRadius: radius.md, paddingVertical: 18, alignItems: 'center', marginTop: 18 },
  sendTxt: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
