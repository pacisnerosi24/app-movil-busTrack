"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LoginScreen;
const react_1 = require("react");
const react_native_1 = require("react-native");
const vector_icons_1 = require("@expo/vector-icons");
const api_1 = require("../api");
const theme_1 = require("../theme");
function LoginScreen({ onLogin }) {
    const [email, setEmail] = (0, react_1.useState)('conductor1@bustrack.com');
    const [password, setPassword] = (0, react_1.useState)('Test1234!');
    const [verPass, setVerPass] = (0, react_1.useState)(false);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    async function handleLogin() {
        setLoading(true);
        setError(null);
        try {
            const { token, usuario } = await (0, api_1.login)(email.trim(), password);
            onLogin(token, usuario);
        }
        catch (e) {
            setError(e.message ?? 'No se pudo iniciar sesión');
        }
        finally {
            setLoading(false);
        }
    }
    return (<react_native_1.KeyboardAvoidingView style={styles.root} behavior={react_native_1.Platform.OS === 'ios' ? 'padding' : undefined}>
      <react_native_1.ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        
        <react_native_1.View style={styles.logoWrap}>
          <react_native_1.View style={styles.logoEarL}/>
          <react_native_1.View style={styles.logoFace}>
            <vector_icons_1.MaterialCommunityIcons name="robot-outline" size={40} color={theme_1.colors.yellow}/>
          </react_native_1.View>
          <react_native_1.View style={styles.logoEarR}/>
        </react_native_1.View>

        <react_native_1.Text style={styles.brand}>RutaSegura</react_native_1.Text>
        <react_native_1.Text style={styles.subtitle}>Movilidad inteligente y seguridad ciudadana</react_native_1.Text>

        
        <react_native_1.View style={styles.inputWrap}>
          <react_native_1.TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Correo institucional" placeholderTextColor={theme_1.colors.textMutedLight} autoCapitalize="none" keyboardType="email-address"/>
        </react_native_1.View>

        
        <react_native_1.View style={styles.inputWrap}>
          <react_native_1.TextInput style={[styles.input, { flex: 1 }]} value={password} onChangeText={setPassword} placeholder="Contraseña" placeholderTextColor={theme_1.colors.textMutedLight} secureTextEntry={!verPass}/>
          <react_native_1.TouchableOpacity onPress={() => setVerPass(v => !v)} hitSlop={10}>
            <vector_icons_1.Ionicons name={verPass ? 'eye-off' : 'eye'} size={22} color={theme_1.colors.textMutedLight}/>
          </react_native_1.TouchableOpacity>
        </react_native_1.View>

        {error && <react_native_1.Text style={styles.error}>⚠ {error}</react_native_1.Text>}

        
        <react_native_1.TouchableOpacity style={[styles.primaryBtn, loading && { opacity: 0.7 }]} onPress={handleLogin} disabled={loading}>
          {loading ? <react_native_1.ActivityIndicator color={theme_1.colors.navy}/> : <react_native_1.Text style={styles.primaryTxt}>Iniciar viaje seguro</react_native_1.Text>}
        </react_native_1.TouchableOpacity>

        
        <react_native_1.Text style={styles.quickLabel}>Acceso rápido</react_native_1.Text>
        <react_native_1.View style={styles.quickRow}>
          <QuickBtn label="Google" icon={<vector_icons_1.Ionicons name="logo-google" size={20} color={theme_1.colors.textLight}/>}/>
          <QuickBtn label="Apple" icon={<vector_icons_1.Ionicons name="logo-apple" size={20} color={theme_1.colors.textLight}/>}/>
          <QuickBtn label="Huella" icon={<vector_icons_1.Ionicons name="finger-print" size={20} color={theme_1.colors.textLight}/>}/>
        </react_native_1.View>

        
        <react_native_1.TouchableOpacity style={styles.outlineBtn} onPress={() => setError('El registro ciudadano estará disponible pronto.')}>
          <react_native_1.Text style={styles.outlineTxt}>Crear cuenta ciudadana</react_native_1.Text>
        </react_native_1.TouchableOpacity>

        <react_native_1.Text style={styles.footer}>Protección comunitaria en transporte urbano</react_native_1.Text>
      </react_native_1.ScrollView>
    </react_native_1.KeyboardAvoidingView>);
}
function QuickBtn({ label, icon }) {
    return (<react_native_1.TouchableOpacity style={styles.quickBtn} activeOpacity={0.7}>
      {icon}
      <react_native_1.Text style={styles.quickTxt}>{label}</react_native_1.Text>
    </react_native_1.TouchableOpacity>);
}
const styles = react_native_1.StyleSheet.create({
    root: { flex: 1, backgroundColor: theme_1.colors.navy },
    container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
    logoWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
    logoFace: { width: 82, height: 82, borderRadius: 22, borderWidth: 2, borderColor: theme_1.colors.yellow, backgroundColor: theme_1.colors.navyCard, alignItems: 'center', justifyContent: 'center' },
    logoEarL: { width: 26, height: 44, borderTopLeftRadius: 22, borderBottomLeftRadius: 22, borderWidth: 2, borderRightWidth: 0, borderColor: '#6B7D5A', marginRight: -6 },
    logoEarR: { width: 26, height: 44, borderTopRightRadius: 22, borderBottomRightRadius: 22, borderWidth: 2, borderLeftWidth: 0, borderColor: '#6B7D5A', marginLeft: -6 },
    brand: { fontSize: 38, fontWeight: '900', color: theme_1.colors.white, textAlign: 'center', letterSpacing: -0.5 },
    subtitle: { fontSize: 15, color: theme_1.colors.textMutedLight, textAlign: 'center', marginTop: 6, marginBottom: 28 },
    inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme_1.colors.navyCard, borderRadius: theme_1.radius.md, paddingHorizontal: 18, marginBottom: 14 },
    input: { paddingVertical: 18, color: theme_1.colors.white, fontSize: 16 },
    error: { color: '#FCA5A5', marginBottom: 12, fontSize: 13 },
    primaryBtn: { backgroundColor: theme_1.colors.yellow, borderRadius: theme_1.radius.md, paddingVertical: 18, alignItems: 'center', marginTop: 4 },
    primaryTxt: { color: theme_1.colors.navy, fontWeight: '800', fontSize: 17 },
    quickLabel: { color: theme_1.colors.textMutedLight, textAlign: 'center', fontWeight: '700', fontSize: 13, marginTop: 22, marginBottom: 12 },
    quickRow: { flexDirection: 'row', gap: 12 },
    quickBtn: { flex: 1, backgroundColor: theme_1.colors.navyCard, borderRadius: theme_1.radius.md, paddingVertical: 18, alignItems: 'center', gap: 4 },
    quickTxt: { color: theme_1.colors.textLight, fontWeight: '700', fontSize: 13 },
    outlineBtn: { borderWidth: 1.5, borderColor: theme_1.colors.navyBorder, borderRadius: theme_1.radius.md, paddingVertical: 17, alignItems: 'center', marginTop: 14 },
    outlineTxt: { color: theme_1.colors.white, fontWeight: '700', fontSize: 15 },
    footer: { color: theme_1.colors.textMutedLight, textAlign: 'center', fontSize: 13, marginTop: 22 },
});
//# sourceMappingURL=LoginScreen.js.map