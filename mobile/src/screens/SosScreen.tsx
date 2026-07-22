import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { dispararAlerta } from '../api';
import { useApp } from '../AppContext';
import { colors, radius } from '../theme';

export default function SosScreen({ navigation }: any) {
  // El pánico funciona SIEMPRE; si el pasajero confirmó ir a bordo de un bus,
  // la alerta lleva ese contexto (unidad exacta). Si no, usa la ruta que mira.
  const { token, rutaSeleccionada, busABordo } = useApp();
  const [enviando, setEnviando] = useState(false);

  const busContexto = busABordo ?? rutaSeleccionada;

  async function panico() {
    setEnviando(true);
    try {
      const idBus = busContexto?.idBus ?? 'BUS-014';
      const r = await dispararAlerta(token, idBus);
      Alert.alert('🚨 SOS enviado', r.mensaje);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo enviar el SOS');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>Botón de pánico</Text>

        {/* Estado del bus: da certeza de a quién se avisará */}
        {busABordo ? (
          <View style={[styles.estado, { borderColor: colors.green }]}>
            <View style={styles.estadoDot} />
            <Text style={styles.estadoTxt} numberOfLines={1}>A bordo del {busABordo.nombre} · unidad {busABordo.idBus}</Text>
          </View>
        ) : (
          <View style={[styles.estado, { borderColor: colors.navyBorder }]}>
            <Ionicons name="information-circle-outline" size={18} color={colors.textMutedLight} />
            <Text style={[styles.estadoTxt, { color: colors.textMutedLight }]} numberOfLines={2}>
              {rutaSeleccionada ? `Sin confirmar a bordo · se usará ${rutaSeleccionada.nombre}` : 'Sin bus · solo se enviará tu ubicación'}
            </Text>
          </View>
        )}

        <Text style={styles.sub}>
          Mantén la calma. Al presionar, se notifica a las autoridades y a la comunidad
          {busABordo ? ` del ${busABordo.nombre}` : ''}.
        </Text>

        <TouchableOpacity style={styles.sosBtn} onPress={panico} disabled={enviando} activeOpacity={0.85}>
          {enviando
            ? <ActivityIndicator color="#fff" size="large" />
            : <>
                <MaterialCommunityIcons name="alarm-light" size={56} color="#fff" />
                <Text style={styles.sosTxt}>SOS</Text>
              </>}
        </TouchableOpacity>

        <Text style={styles.hint}>Envía una alerta PANICO_MANUAL al backend real.</Text>

        <TouchableOpacity
          style={styles.deteccionBtn}
          onPress={() => navigation.navigate('DeteccionAudio')}
          activeOpacity={0.85}
        >
          <Ionicons name="mic" size={20} color={colors.primary} />
          <Text style={styles.deteccionTxt}>Detección de audio con IA</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMutedLight} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navy },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  title: { color: colors.textLight, fontSize: 26, fontWeight: '900' },
  estado: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.navyCard, borderWidth: 1.5, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 11, marginTop: 16, maxWidth: 420 },
  estadoDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.green },
  estadoTxt: { flex: 1, color: colors.textLight, fontSize: 13.5, fontWeight: '700' },
  sub: { color: colors.textMutedLight, fontSize: 15, textAlign: 'center', marginTop: 16, marginBottom: 40, lineHeight: 22 },
  sosBtn: { width: 200, height: 200, borderRadius: 100, backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center', shadowColor: colors.red, shadowOpacity: 0.5, shadowRadius: 30, shadowOffset: { width: 0, height: 0 }, elevation: 12 },
  sosTxt: { color: '#fff', fontSize: 40, fontWeight: '900', marginTop: 4 },
  hint: { color: colors.textMutedLight, fontSize: 13, marginTop: 40 },
  deteccionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.navyCard,
    borderWidth: 1,
    borderColor: colors.navyBorder,
    borderRadius: radius.lg,
    paddingVertical: 15,
    paddingHorizontal: 18,
    marginTop: 20,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  deteccionTxt: { color: colors.textLight, fontSize: 15, fontWeight: '800', flex: 1, textAlign: 'center' },
});
