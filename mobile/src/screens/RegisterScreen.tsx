import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { registrar, login, Usuario, Rol } from '../api';
import { colors, radius } from '../theme';

type Props = {
  onRegistrado: (token: string, usuario: Usuario) => void;
  onVolver: () => void;
};

// Requisitos del backend: min 8, una mayúscula, una minúscula, un carácter especial.
const PASS_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;

export default function RegisterScreen({ onRegistrado, onVolver }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [rol, setRol] = useState<Rol>('pasajero');
  const [verPass, setVerPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegistro() {
    setError(null);
    if (!PASS_REGEX.test(password)) {
      setError('La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un carácter especial.');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      await registrar(email.trim(), password, rol);
      // Auto-login tras registrarse: entra directo.
      const { token, usuario } = await login(email.trim(), password);
      onRegistrado(token, usuario);
    } catch (e: any) {
      setError(e.message ?? 'No se pudo crear la cuenta');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.back} onPress={onVolver} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={colors.textLight} />
        </TouchableOpacity>

        <Text style={styles.brand}>Crear cuenta</Text>
        <Text style={styles.subtitle}>Únete a RutaSegura</Text>

        {/* Rol */}
        <Text style={styles.label}>Soy</Text>
        <View style={styles.rolRow}>
          <RolBtn activo={rol === 'pasajero'} onPress={() => setRol('pasajero')} icon="person" texto="Pasajero" color={colors.blue} />
          <RolBtn activo={rol === 'conductor'} onPress={() => setRol('conductor')} icon="bus" texto="Conductor" color={colors.orange} />
        </View>

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

        {/* Confirmar */}
        <View style={styles.inputWrap}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Confirmar contraseña"
            placeholderTextColor={colors.textMutedLight}
            secureTextEntry={!verPass}
          />
        </View>

        <Text style={styles.hint}>Mínimo 8 caracteres, una mayúscula, una minúscula y un carácter especial.</Text>

        {error && <Text style={styles.error}>⚠ {error}</Text>}

        <TouchableOpacity style={[styles.primaryBtn, loading && { opacity: 0.7 }]} onPress={handleRegistro} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.primaryTxt}>Crear cuenta ciudadana</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={onVolver} style={styles.loginLink}>
          <Text style={styles.loginTxt}>¿Ya tienes cuenta? <Text style={{ color: colors.primaryLight, fontWeight: '800' }}>Inicia sesión</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function RolBtn({ activo, onPress, icon, texto, color }: { activo: boolean; onPress: () => void; icon: any; texto: string; color: string }) {
  return (
    <TouchableOpacity
      style={[styles.rolBtn, activo && { borderColor: color, backgroundColor: color + '22' }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <MaterialCommunityIcons name={icon} size={26} color={activo ? color : colors.textMutedLight} />
      <Text style={[styles.rolBtnTxt, activo && { color }]}>{texto}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navy },
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  back: { position: 'absolute', top: 40, left: 20 },
  brand: { fontSize: 32, fontWeight: '900', color: colors.textLight, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: colors.textMutedLight, marginTop: 4, marginBottom: 22 },
  label: { fontSize: 13, color: colors.textMutedLight, fontWeight: '700', marginBottom: 8 },
  rolRow: { flexDirection: 'row', gap: 12, marginBottom: 18 },
  rolBtn: { flex: 1, alignItems: 'center', gap: 6, backgroundColor: colors.navyCard, borderRadius: radius.md, paddingVertical: 18, borderWidth: 1.5, borderColor: colors.navyBorder },
  rolBtnTxt: { color: colors.textMutedLight, fontWeight: '700', fontSize: 14 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.navyCard, borderRadius: radius.md, paddingHorizontal: 18, marginBottom: 14, borderWidth: 1, borderColor: colors.navyBorder },
  input: { paddingVertical: 17, color: colors.textLight, fontSize: 16 },
  hint: { color: colors.textMutedLight, fontSize: 12, marginBottom: 6 },
  error: { color: colors.red, marginBottom: 10, fontSize: 13 },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 18, alignItems: 'center', marginTop: 8 },
  primaryTxt: { color: colors.white, fontWeight: '800', fontSize: 17 },
  loginLink: { alignItems: 'center', marginTop: 20 },
  loginTxt: { color: colors.textMutedLight, fontSize: 14 },
});
