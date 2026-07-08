"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SosScreen;
const react_1 = require("react");
const react_native_1 = require("react-native");
const react_native_safe_area_context_1 = require("react-native-safe-area-context");
const vector_icons_1 = require("@expo/vector-icons");
const api_1 = require("../api");
const AppContext_1 = require("../AppContext");
const theme_1 = require("../theme");
function SosScreen() {
    const { token, rutaSeleccionada } = (0, AppContext_1.useApp)();
    const [enviando, setEnviando] = (0, react_1.useState)(false);
    async function panico() {
        setEnviando(true);
        try {
            const idBus = rutaSeleccionada?.idBus ?? 'BUS-014';
            const r = await (0, api_1.dispararAlerta)(token, idBus);
            react_native_1.Alert.alert('🚨 SOS enviado', r.mensaje);
        }
        catch (e) {
            react_native_1.Alert.alert('Error', e.message ?? 'No se pudo enviar el SOS');
        }
        finally {
            setEnviando(false);
        }
    }
    return (<react_native_safe_area_context_1.SafeAreaView style={styles.root} edges={['top']}>
      <react_native_1.View style={styles.content}>
        <react_native_1.Text style={styles.title}>Botón de pánico</react_native_1.Text>
        <react_native_1.Text style={styles.sub}>
          Mantén la calma. Al presionar, se notifica a las autoridades y a la comunidad
          {rutaSeleccionada ? ` en ${rutaSeleccionada.nombre}` : ''}.
        </react_native_1.Text>

        <react_native_1.TouchableOpacity style={styles.sosBtn} onPress={panico} disabled={enviando} activeOpacity={0.85}>
          {enviando
            ? <react_native_1.ActivityIndicator color="#fff" size="large"/>
            : <>
                <vector_icons_1.MaterialCommunityIcons name="alarm-light" size={56} color="#fff"/>
                <react_native_1.Text style={styles.sosTxt}>SOS</react_native_1.Text>
              </>}
        </react_native_1.TouchableOpacity>

        <react_native_1.Text style={styles.hint}>Envía una alerta PANICO_MANUAL al backend real.</react_native_1.Text>
      </react_native_1.View>
    </react_native_safe_area_context_1.SafeAreaView>);
}
const styles = react_native_1.StyleSheet.create({
    root: { flex: 1, backgroundColor: theme_1.colors.navy },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
    title: { color: '#fff', fontSize: 26, fontWeight: '900' },
    sub: { color: theme_1.colors.textMutedLight, fontSize: 15, textAlign: 'center', marginTop: 10, marginBottom: 40, lineHeight: 22 },
    sosBtn: { width: 200, height: 200, borderRadius: 100, backgroundColor: theme_1.colors.red, alignItems: 'center', justifyContent: 'center', shadowColor: theme_1.colors.red, shadowOpacity: 0.5, shadowRadius: 30, shadowOffset: { width: 0, height: 0 }, elevation: 12 },
    sosTxt: { color: '#fff', fontSize: 40, fontWeight: '900', marginTop: 4 },
    hint: { color: theme_1.colors.textMutedLight, fontSize: 13, marginTop: 40 },
});
//# sourceMappingURL=SosScreen.js.map