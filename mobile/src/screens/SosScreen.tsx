import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { dispararAlerta } from '../api';
import { useApp } from '../AppContext';
import { colors, radius } from '../theme';

export default function SosScreen() {
  const { token, rutaSeleccionada } = useApp();
  const [enviando, setEnviando] = useState(false);

  async function panico() {
    setEnviando(true);
    try {
      const idBus = rutaSeleccionada?.idBus ?? 'BUS-014';
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
        <Text style={styles.sub}>
          Mantén la calma. Al presionar, se notifica a las autoridades y a la comunidad
          {rutaSeleccionada ? ` en ${rutaSeleccionada.nombre}` : ''}.
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navy },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  title: { color: colors.textLight, fontSize: 26, fontWeight: '900' },
  sub: { color: colors.textMutedLight, fontSize: 15, textAlign: 'center', marginTop: 10, marginBottom: 40, lineHeight: 22 },
  sosBtn: { width: 200, height: 200, borderRadius: 100, backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center', shadowColor: colors.red, shadowOpacity: 0.5, shadowRadius: 30, shadowOffset: { width: 0, height: 0 }, elevation: 12 },
  sosTxt: { color: '#fff', fontSize: 40, fontWeight: '900', marginTop: 4 },
  hint: { color: colors.textMutedLight, fontSize: 13, marginTop: 40 },
});
