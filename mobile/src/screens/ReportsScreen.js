"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ReportsScreen;
const react_1 = require("react");
const react_native_1 = require("react-native");
const react_native_safe_area_context_1 = require("react-native-safe-area-context");
const vector_icons_1 = require("@expo/vector-icons");
const mockData_1 = require("../mockData");
const api_1 = require("../api");
const AppContext_1 = require("../AppContext");
const theme_1 = require("../theme");
const ICONS = {
    alert: (c) => <vector_icons_1.Ionicons name="alert" size={24} color={c}/>,
    help: (c) => <vector_icons_1.Ionicons name="help" size={24} color={c}/>,
    bus: (c) => <vector_icons_1.MaterialCommunityIcons name="bus" size={24} color={c}/>,
};
function ReportsScreen() {
    const { token, rutaSeleccionada } = (0, AppContext_1.useApp)();
    const [sel, setSel] = (0, react_1.useState)(null);
    const [enviando, setEnviando] = (0, react_1.useState)(false);
    async function enviar() {
        if (!sel)
            return;
        setEnviando(true);
        try {
            const idBus = rutaSeleccionada?.idBus ?? 'BUS-014';
            const r = await (0, api_1.dispararAlerta)(token, idBus);
            react_native_1.Alert.alert(r.esCritica ? '🚨 Alerta enviada' : 'Alerta registrada', `${sel.titulo}\n\n${r.mensaje}`);
            setSel(null);
        }
        catch (e) {
            react_native_1.Alert.alert('Error', e.message ?? 'No se pudo enviar la alerta');
        }
        finally {
            setEnviando(false);
        }
    }
    return (<react_native_safe_area_context_1.SafeAreaView style={styles.root} edges={['top']}>
      <react_native_1.ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 30 }}>
        
        <react_native_1.View style={styles.banner}>
          <react_native_1.View style={{ flex: 1 }}>
            <react_native_1.Text style={styles.bannerTitle}>Reportar incidente</react_native_1.Text>
            <react_native_1.Text style={styles.bannerSub}>Clasifica el suceso en un solo toque</react_native_1.Text>
          </react_native_1.View>
          <react_native_1.View style={styles.bannerIcon}><vector_icons_1.Ionicons name="alert" size={30} color="#fff"/></react_native_1.View>
        </react_native_1.View>

        <react_native_1.Text style={styles.section}>Tipo de alerta</react_native_1.Text>

        {mockData_1.TIPOS_INCIDENTE.map(t => {
            const activa = sel?.id === t.id;
            return (<react_native_1.TouchableOpacity key={t.id} activeOpacity={0.85} onPress={() => setSel(activa ? null : t)} style={[styles.card, activa && { borderColor: t.color, backgroundColor: t.colorSoft }]}>
              <react_native_1.View style={[styles.cardIcon, { backgroundColor: t.colorSoft }]}>{ICONS[t.icon](t.color)}</react_native_1.View>
              <react_native_1.View style={{ flex: 1 }}>
                <react_native_1.Text style={styles.cardTitle}>{t.titulo}</react_native_1.Text>
                <react_native_1.Text style={styles.cardDesc}>{t.descripcion}</react_native_1.Text>
              </react_native_1.View>
              {activa
                    ? <react_native_1.View style={[styles.check, { backgroundColor: t.color }]}><vector_icons_1.Ionicons name="checkmark" size={16} color="#fff"/></react_native_1.View>
                    : <vector_icons_1.Ionicons name="chevron-forward" size={20} color={theme_1.colors.textMutedDark}/>}
            </react_native_1.TouchableOpacity>);
        })}

        
        <react_native_1.View style={styles.community}>
          <react_native_1.Text style={styles.communityTitle}>Alerta comunitaria</react_native_1.Text>
          <react_native_1.Text style={styles.communityTxt}>Los pasajeros cercanos verán una advertencia visual en la ruta.</react_native_1.Text>
        </react_native_1.View>

        <react_native_1.TouchableOpacity style={[styles.sendBtn, sel ? { backgroundColor: theme_1.colors.red } : { backgroundColor: '#C3CBD6' }]} onPress={enviar} disabled={!sel || enviando} activeOpacity={0.9}>
          {enviando ? <react_native_1.ActivityIndicator color="#fff"/> : <react_native_1.Text style={styles.sendTxt}>Enviar Alerta a la Comunidad</react_native_1.Text>}
        </react_native_1.TouchableOpacity>
      </react_native_1.ScrollView>
    </react_native_safe_area_context_1.SafeAreaView>);
}
const styles = react_native_1.StyleSheet.create({
    root: { flex: 1, backgroundColor: theme_1.colors.lightBg },
    banner: { backgroundColor: theme_1.colors.navy, borderRadius: theme_1.radius.lg, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
    bannerTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
    bannerSub: { color: theme_1.colors.textMutedLight, fontSize: 14, marginTop: 4 },
    bannerIcon: { width: 58, height: 58, borderRadius: 16, backgroundColor: theme_1.colors.red, alignItems: 'center', justifyContent: 'center' },
    section: { color: theme_1.colors.textDark, fontSize: 19, fontWeight: '800', marginTop: 22, marginBottom: 12 },
    card: { backgroundColor: '#fff', borderRadius: theme_1.radius.md, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12, borderWidth: 1.5, borderColor: 'transparent' },
    cardIcon: { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
    cardTitle: { color: theme_1.colors.textDark, fontSize: 17, fontWeight: '800' },
    cardDesc: { color: theme_1.colors.textMutedDark, fontSize: 14, marginTop: 2 },
    check: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    community: { backgroundColor: '#fff', borderRadius: theme_1.radius.md, padding: 18, marginTop: 8 },
    communityTitle: { color: theme_1.colors.textDark, fontSize: 20, fontWeight: '900' },
    communityTxt: { color: theme_1.colors.textMutedDark, fontSize: 15, marginTop: 8, lineHeight: 21 },
    sendBtn: { borderRadius: theme_1.radius.md, paddingVertical: 18, alignItems: 'center', marginTop: 18 },
    sendTxt: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
//# sourceMappingURL=ReportsScreen.js.map