import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { login, Usuario } from '../api';
import { colors, radius } from '../theme';

type Props = {
  onLogin: (token: string, usuario: Usuario) => void;
  onIrARegistro: () => void;
};

export default function LoginScreen({ onLogin, onIrARegistro }: Props) {
  const [email, setEmail] = useState('conductor1@bustrack.com');
  const [password, setPassword] = useState('Test1234!');
  const [verPass, setVerPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setLoading(true); setError(null);
    try {
      const { token, usuario } = await login(email.trim(), password);
      onLogin(token, usuario);
    } catch (e: any) {
      setError(e.message ?? 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Logo mascota */}
        <View style={styles.logoWrap}>
          <View style={styles.logoEarL} />
          <View style={styles.logoFace}>
            <MaterialCommunityIcons name="robot-outline" size={40} color={colors.yellow} />
          </View>
          <View style={styles.logoEarR} />
        </View>

        <Text style={styles.brand}>RutaSegura</Text>
        <Text style={styles.subtitle}>Movilidad inteligente y seguridad ciudadana</Text>

        {/* Correo */}
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Correo institucional"
            placeholderTextColor={colors.textMutedLight}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* Contraseña */}
        <View style={styles.inputWrap}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={password}
            onChangeText={setPassword}
            placeholder="Contraseña"
            placeholderTextColor={colors.textMutedLight}
            secureTextEntry={!verPass}
          />
          <TouchableOpacity onPress={() => setVerPass(v => !v)} hitSlop={10}>
            <Ionicons name={verPass ? 'eye-off' : 'eye'} size={22} color={colors.textMutedLight} />
          </TouchableOpacity>
        </View>

        {error && <Text style={styles.error}>⚠ {error}</Text>}

        {/* Botón principal */}
        <TouchableOpacity style={[styles.primaryBtn, loading && { opacity: 0.7 }]} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.primaryTxt}>Iniciar viaje seguro</Text>}
        </TouchableOpacity>

        {/* Acceso rápido */}
        <Text style={styles.quickLabel}>Acceso rápido</Text>
        <View style={styles.quickRow}>
          <QuickBtn label="Google" icon={<Ionicons name="logo-google" size={20} color={colors.textLight} />} />
          <QuickBtn label="Apple" icon={<Ionicons name="logo-apple" size={20} color={colors.textLight} />} />
          <QuickBtn label="Huella" icon={<Ionicons name="finger-print" size={20} color={colors.textLight} />} />
        </View>

        {/* Crear cuenta */}
        <TouchableOpacity style={styles.outlineBtn} onPress={onIrARegistro}>
          <Text style={styles.outlineTxt}>Crear cuenta ciudadana</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>Protección comunitaria en transporte urbano</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function QuickBtn({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <TouchableOpacity style={styles.quickBtn} activeOpacity={0.7}>
      {icon}
      <Text style={styles.quickTxt}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navy },
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  logoWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  logoFace: { width: 82, height: 82, borderRadius: 22, borderWidth: 2, borderColor: colors.yellow, backgroundColor: colors.navyCard, alignItems: 'center', justifyContent: 'center' },
  logoEarL: { width: 26, height: 44, borderTopLeftRadius: 22, borderBottomLeftRadius: 22, borderWidth: 2, borderRightWidth: 0, borderColor: '#6B7D5A', marginRight: -6 },
  logoEarR: { width: 26, height: 44, borderTopRightRadius: 22, borderBottomRightRadius: 22, borderWidth: 2, borderLeftWidth: 0, borderColor: '#6B7D5A', marginLeft: -6 },
  brand: { fontSize: 38, fontWeight: '900', color: colors.white, textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: colors.textMutedLight, textAlign: 'center', marginTop: 6, marginBottom: 28 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.navyCard, borderRadius: radius.md, paddingHorizontal: 18, marginBottom: 14 },
  input: { paddingVertical: 18, color: colors.white, fontSize: 16 },
  error: { color: '#FCA5A5', marginBottom: 12, fontSize: 13 },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 18, alignItems: 'center', marginTop: 4 },
  primaryTxt: { color: colors.white, fontWeight: '800', fontSize: 17 },
  quickLabel: { color: colors.textMutedLight, textAlign: 'center', fontWeight: '700', fontSize: 13, marginTop: 22, marginBottom: 12 },
  quickRow: { flexDirection: 'row', gap: 12 },
  quickBtn: { flex: 1, backgroundColor: colors.navyCard, borderRadius: radius.md, paddingVertical: 18, alignItems: 'center', gap: 4 },
  quickTxt: { color: colors.textLight, fontWeight: '700', fontSize: 13 },
  outlineBtn: { borderWidth: 1.5, borderColor: colors.navyBorder, borderRadius: radius.md, paddingVertical: 17, alignItems: 'center', marginTop: 14 },
  outlineTxt: { color: colors.white, fontWeight: '700', fontSize: 15 },
  footer: { color: colors.textMutedLight, textAlign: 'center', fontSize: 13, marginTop: 22 },
});
