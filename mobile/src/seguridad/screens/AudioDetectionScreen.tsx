import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAudioDetection } from '../hooks/useAudioDetection';
import { LABELS, type Label } from '../services/AudioDetectionService';
import { dispararAlerta } from '../../api';
import { useApp } from '../../AppContext';
import { colors, radius } from '../../theme';

const CLASS_META: Record<Label, { nombre: string; icono: any; color: string; colorSoft: string }> = {
  normal: { nombre: 'Normal', icono: 'shield-check', color: colors.green, colorSoft: colors.greenSoft },
  grito: { nombre: 'Grito', icono: 'bullhorn', color: colors.orange, colorSoft: colors.orangeSoft },
  pelea: { nombre: 'Pelea', icono: 'boxing-glove', color: colors.red, colorSoft: colors.redSoft },
  choque: { nombre: 'Choque', icono: 'car', color: colors.purple, colorSoft: '#E5DEFC' },
};

function horaDe(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function AudioDetectionScreen({ navigation }: any) {
  const { token, rutaSeleccionada } = useApp();
  const { modo, isModelLoading, isListening, isProcessing, lastResult, history, error, start, stop } =
    useAudioDetection();
  const [enviandoSos, setEnviandoSos] = useState(false);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isListening) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.12, duration: 700, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
    pulse.setValue(1);
  }, [isListening, pulse]);

  async function enviarSos() {
    setEnviandoSos(true);
    try {
      const idBus = rutaSeleccionada?.idBus ?? 'BUS-014';
      const r = await dispararAlerta(token, idBus);
      Alert.alert('🚨 SOS enviado', r.mensaje);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo enviar el SOS');
    } finally {
      setEnviandoSos(false);
    }
  }

  const meta = lastResult ? CLASS_META[lastResult.label] : null;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={colors.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detección de audio</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sub}>
          La IA escucha el ambiente y clasifica cada 3 segundos si hay una situación normal, un
          grito, una pelea o un choque.
        </Text>

        <View style={styles.modoBadge}>
          <Ionicons
            name={modo === 'remoto' ? 'cloud-outline' : 'phone-portrait-outline'}
            size={14}
            color={colors.primary}
          />
          <Text style={styles.modoTxt}>
            {modo === 'remoto'
              ? 'Análisis en el servidor (Expo Go)'
              : 'Análisis en el dispositivo (sin internet)'}
          </Text>
        </View>

        <View style={styles.micWrap}>
          <Animated.View style={{ transform: [{ scale: pulse }] }}>
            <TouchableOpacity
              style={[styles.micBtn, isListening && styles.micBtnActive]}
              onPress={isListening ? stop : start}
              disabled={isModelLoading}
              activeOpacity={0.85}
            >
              {isModelLoading ? (
                <ActivityIndicator color="#fff" size="large" />
              ) : (
                <MaterialCommunityIcons
                  name={isListening ? 'stop' : 'microphone'}
                  size={52}
                  color="#fff"
                />
              )}
            </TouchableOpacity>
          </Animated.View>
          <Text style={styles.micLabel}>
            {isModelLoading
              ? 'Cargando modelo IA…'
              : isListening
                ? isProcessing
                  ? 'Analizando…'
                  : 'Escuchando…'
                : 'Toca para iniciar la escucha'}
          </Text>
        </View>

        {error != null && (
          <View style={styles.errorCard}>
            <Ionicons name="warning" size={18} color={colors.red} />
            <Text style={styles.errorTxt}>{error}</Text>
          </View>
        )}

        {lastResult?.isAnomaly && (
          <View style={styles.alertCard}>
            <View style={styles.alertRow}>
              <MaterialCommunityIcons name="alarm-light" size={26} color="#fff" />
              <Text style={styles.alertTitle}>
                ¡Anomalía detectada: {CLASS_META[lastResult.label].nombre}!
              </Text>
            </View>
            <TouchableOpacity
              style={styles.alertBtn}
              onPress={enviarSos}
              disabled={enviandoSos}
              activeOpacity={0.85}
            >
              {enviandoSos ? (
                <ActivityIndicator color={colors.red} size="small" />
              ) : (
                <Text style={styles.alertBtnTxt}>Enviar SOS</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {lastResult && meta && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Última detección</Text>
            <View style={styles.resultRow}>
              <View style={[styles.resultIcon, { backgroundColor: meta.colorSoft }]}>
                <MaterialCommunityIcons name={meta.icono} size={28} color={meta.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.resultLabel, { color: meta.color }]}>{meta.nombre}</Text>
                <Text style={styles.resultConf}>
                  Confianza: {(lastResult.confidence * 100).toFixed(1)}%
                </Text>
              </View>
              <Text style={styles.resultHora}>{horaDe(lastResult.timestamp)}</Text>
            </View>

            {LABELS.map((label) => {
              const p = lastResult.probabilities[label];
              const m = CLASS_META[label];
              return (
                <View key={label} style={styles.barRow}>
                  <Text style={styles.barLabel}>{m.nombre}</Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${Math.round(p * 100)}%`, backgroundColor: m.color },
                      ]}
                    />
                  </View>
                  <Text style={styles.barPct}>{(p * 100).toFixed(0)}%</Text>
                </View>
              );
            })}
          </View>
        )}

        {history.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Historial reciente</Text>
            {history.slice(0, 8).map((item) => {
              const m = CLASS_META[item.label];
              return (
                <View key={item.timestamp} style={styles.histRow}>
                  <Text style={styles.histHora}>{horaDe(item.timestamp)}</Text>
                  <View style={[styles.histChip, { backgroundColor: m.colorSoft }]}>
                    <Text style={[styles.histChipTxt, { color: m.color }]}>{m.nombre}</Text>
                  </View>
                  <Text style={styles.histConf}>{(item.confidence * 100).toFixed(0)}%</Text>
                </View>
              );
            })}
          </View>
        )}

        <Text style={styles.hint}>
          {modo === 'remoto'
            ? 'Modelo TFLite INT8 (2.7 MB) ejecutado por el backend · ventanas de 3 s · umbral 60%'
            : 'Modelo TFLite INT8 (2.7 MB) · 16 kHz · ventanas de 3 s · umbral de anomalía 60%'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navy },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.textLight, fontSize: 18, fontWeight: '900' },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  sub: { color: colors.textMutedLight, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  modoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    alignSelf: 'center',
    backgroundColor: colors.navyCardAlt,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 12,
  },
  modoTxt: { color: colors.primary, fontSize: 12.5, fontWeight: '800' },
  micWrap: { alignItems: 'center', marginVertical: 28 },
  micBtn: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  micBtnActive: { backgroundColor: colors.red, shadowColor: colors.red },
  micLabel: { color: colors.textMutedLight, fontSize: 14, fontWeight: '700', marginTop: 16 },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.redSoft,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 16,
  },
  errorTxt: { color: colors.red, fontSize: 13, fontWeight: '700', flex: 1 },
  alertCard: {
    backgroundColor: colors.red,
    borderRadius: radius.lg,
    padding: 18,
    marginBottom: 16,
  },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  alertTitle: { color: '#fff', fontSize: 16, fontWeight: '900', flex: 1 },
  alertBtn: {
    backgroundColor: '#fff',
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  alertBtnTxt: { color: colors.red, fontSize: 15, fontWeight: '900' },
  card: {
    backgroundColor: colors.navyCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.navyBorder,
    padding: 18,
    marginBottom: 16,
  },
  cardTitle: { color: colors.textLight, fontSize: 15, fontWeight: '900', marginBottom: 14 },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  resultIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultLabel: { fontSize: 20, fontWeight: '900' },
  resultConf: { color: colors.textMutedLight, fontSize: 13, fontWeight: '600', marginTop: 2 },
  resultHora: { color: colors.textMutedLight, fontSize: 12, fontWeight: '600' },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  barLabel: { color: colors.textLight, fontSize: 12.5, fontWeight: '700', width: 52 },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.navyCardAlt,
    overflow: 'hidden',
  },
  barFill: { height: 8, borderRadius: 4 },
  barPct: { color: colors.textMutedLight, fontSize: 12, fontWeight: '700', width: 38, textAlign: 'right' },
  histRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  histHora: { color: colors.textMutedLight, fontSize: 12.5, fontWeight: '600', width: 70 },
  histChip: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
  histChipTxt: { fontSize: 12.5, fontWeight: '800' },
  histConf: { color: colors.textMutedLight, fontSize: 12.5, fontWeight: '700', marginLeft: 'auto' },
  hint: { color: colors.textMutedLight, fontSize: 12, textAlign: 'center', marginTop: 8 },
});
