import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../AppContext';
import { persistApiBase, resetApiBase, getDefaultApiBase } from '../config';
import { testConnection } from '../api';
import { colors, radius } from '../theme';

// Pantalla para apuntar la app a otra URL de backend (IP local o túnel
// ngrok). Útil en la feria: si la WiFi falla, se usa ngrok y funciona
// desde cualquier red (incluso datos móviles).
export default function SettingsScreen() {
  const { apiBase, updateApiBase } = useApp();
  const [url, setUrl] = useState(apiBase);
  const [probando, setProbando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const modificado = url.replace(/\/+$/, '') !== apiBase.replace(/\/+$/, '');

  async function handleTest() {
    setProbando(true);
    try {
      const trimmed = url.replace(/\/+$/, '');
      const ok = await testConnection(trimmed);
      Alert.alert(
        ok ? 'Conexión exitosa' : 'Sin respuesta',
        ok
          ? `El servidor en ${trimmed} respondió correctamente.`
          : `No se pudo contactar al servidor en ${trimmed}. Verifica la URL y que el backend esté corriendo.`,
      );
    } catch {
      Alert.alert('Error', 'No se pudo probar la conexión.');
    } finally {
      setProbando(false);
    }
  }

  async function handleSave() {
    setGuardando(true);
    try {
      const trimmed = url.replace(/\/+$/, '');
      await persistApiBase(trimmed);
      updateApiBase(trimmed);
      Alert.alert('Guardado', `URL del servidor actualizada a:\n${trimmed}`);
    } catch {
      Alert.alert('Error', 'No se pudo guardar la configuración.');
    } finally {
      setGuardando(false);
    }
  }

  async function handleReset() {
    const def = await resetApiBase();
    setUrl(def);
    updateApiBase(def);
    Alert.alert('Restablecido', `URL restablecida a la autodetectada:\n${def}`);
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Configuración</Text>
        <Text style={styles.subtitle}>Conexión con el servidor backend</Text>

        <View style={styles.card}>
          <Text style={styles.label}>URL del servidor</Text>
          <Text style={styles.hint}>
            Dirección donde corre el backend. Por defecto se autodetecta tu WiFi; puedes
            ponerla manual (IP local o túnel ngrok).
          </Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={url}
              onChangeText={setUrl}
              placeholder="http://192.168.1.50:3000"
              placeholderTextColor={colors.textMutedDark}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.testBtn} onPress={handleTest} disabled={probando} activeOpacity={0.8}>
              {probando ? (
                <ActivityIndicator color={colors.navy} size="small" />
              ) : (
                <>
                  <Ionicons name="flash-outline" size={18} color={colors.navy} />
                  <Text style={styles.testBtnTxt}>Probar</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, !modificado && { opacity: 0.4 }]}
              onPress={handleSave}
              disabled={!modificado || guardando}
              activeOpacity={0.8}
            >
              {guardando ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                  <Text style={styles.saveBtnTxt}>Guardar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.7}>
            <Ionicons name="refresh-outline" size={16} color={colors.textMutedDark} />
            <Text style={styles.resetTxt}>Restablecer (autodetectar WiFi)</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={22} color={colors.blue} />
          <Text style={styles.infoTxt}>
            Si usas ngrok, la URL se verá como:{'\n'}
            https://abc123.ngrok-free.app{'\n\n'}
            Para IP local en la misma red WiFi:{'\n'}
            http://192.168.1.50:3000
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.lightBg },
  content: { padding: 20, paddingBottom: 40 },
  title: { color: colors.textDark, fontSize: 28, fontWeight: '900' },
  subtitle: { color: colors.textMutedDark, fontSize: 15, marginTop: 4, marginBottom: 20 },
  card: {
    backgroundColor: '#fff', borderRadius: radius.lg, padding: 20,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  label: { color: colors.textDark, fontSize: 17, fontWeight: '800', marginBottom: 4 },
  hint: { color: colors.textMutedDark, fontSize: 13, marginBottom: 14 },
  inputRow: { backgroundColor: colors.lightBg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  input: { paddingHorizontal: 16, paddingVertical: 14, color: colors.textDark, fontSize: 15 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  testBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: colors.yellow, borderRadius: radius.md, paddingVertical: 13,
  },
  testBtnTxt: { color: colors.navy, fontWeight: '800', fontSize: 14 },
  saveBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: colors.blue, borderRadius: radius.md, paddingVertical: 13,
  },
  saveBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 14 },
  resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16 },
  resetTxt: { color: colors.textMutedDark, fontSize: 13, fontWeight: '600' },
  infoCard: {
    backgroundColor: '#fff', borderRadius: radius.lg, padding: 18, marginTop: 16, flexDirection: 'row', gap: 10,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 2,
  },
  infoTxt: { color: colors.textMutedDark, fontSize: 13, flex: 1, lineHeight: 20 },
});
