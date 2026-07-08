"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RouteSelectScreen;
const react_1 = require("react");
const react_native_1 = require("react-native");
const react_native_safe_area_context_1 = require("react-native-safe-area-context");
const vector_icons_1 = require("@expo/vector-icons");
const mockData_1 = require("../mockData");
const AppContext_1 = require("../AppContext");
const theme_1 = require("../theme");
function RouteSelectScreen({ navigation }) {
    const { setRutaSeleccionada } = (0, AppContext_1.useApp)();
    const [sel, setSel] = (0, react_1.useState)(null);
    function verMapa() {
        if (!sel)
            return;
        setRutaSeleccionada(sel);
        navigation.navigate('Mapa');
    }
    return (<react_native_safe_area_context_1.SafeAreaView style={styles.root} edges={['top']}>
      <react_native_1.ScrollView contentContainerStyle={{ padding: 20, paddingBottom: sel ? 110 : 30 }}>
        <react_native_1.Text style={styles.step}>PASO 1 DE 1</react_native_1.Text>
        <react_native_1.Text style={styles.title}>¿Qué ruta vas a tomar?</react_native_1.Text>
        <react_native_1.Text style={styles.subtitle}>Selecciona tu línea para ver el mapa en tiempo real</react_native_1.Text>

        {mockData_1.RUTAS.map(r => {
            const activa = sel?.id === r.id;
            return (<react_native_1.TouchableOpacity key={r.id} activeOpacity={0.85} onPress={() => setSel(activa ? null : r)} style={[styles.card, activa && { borderColor: r.color }]}>
              <react_native_1.View style={styles.cardTop}>
                <react_native_1.View style={[styles.icon, { backgroundColor: r.color }]}>
                  <vector_icons_1.MaterialCommunityIcons name="bus" size={24} color="#fff"/>
                </react_native_1.View>
                <react_native_1.View style={{ flex: 1 }}>
                  <react_native_1.View style={styles.nameRow}>
                    <react_native_1.Text style={styles.name}>{r.nombre}</react_native_1.Text>
                    <react_native_1.View style={[styles.badge, { backgroundColor: r.color + '22' }]}>
                      <react_native_1.Text style={[styles.badgeTxt, { color: r.color }]}>{r.etiqueta}</react_native_1.Text>
                    </react_native_1.View>
                  </react_native_1.View>
                  <react_native_1.Text style={styles.route}>{r.origen}  →  {r.destino}</react_native_1.Text>
                </react_native_1.View>
                {activa
                    ? <react_native_1.View style={[styles.check, { backgroundColor: r.color }]}><vector_icons_1.Ionicons name="checkmark" size={16} color="#fff"/></react_native_1.View>
                    : <vector_icons_1.Ionicons name="chevron-forward" size={20} color={theme_1.colors.textMutedLight}/>}
              </react_native_1.View>

              <react_native_1.View style={styles.metaRow}>
                <Meta icon="time-outline" text={`${r.minutos} min`} strong color={activa ? r.color : undefined}/>
                <react_native_1.View style={styles.sep}/>
                <Meta icon="location-outline" text={`${r.paradas} paradas`}/>
                <react_native_1.View style={styles.sep}/>
                <react_native_1.Text style={styles.metaTxt}>{r.tipoBus}</react_native_1.Text>
              </react_native_1.View>

              {activa && (<react_native_1.View style={styles.progressBlock}>
                  <react_native_1.View style={styles.progressLine}>
                    <react_native_1.View style={[styles.dot, { backgroundColor: theme_1.colors.green }]}/>
                    <react_native_1.View style={[styles.bar, { backgroundColor: r.color }]}/>
                    <react_native_1.View style={[styles.dot, { backgroundColor: theme_1.colors.red }]}/>
                  </react_native_1.View>
                  <react_native_1.View style={styles.progressLabels}>
                    <react_native_1.Text style={[styles.progressTxt, { color: theme_1.colors.green }]}>{r.origen}</react_native_1.Text>
                    <react_native_1.Text style={[styles.progressTxt, { color: theme_1.colors.red }]}>{r.destino}</react_native_1.Text>
                  </react_native_1.View>
                </react_native_1.View>)}
            </react_native_1.TouchableOpacity>);
        })}

        <react_native_1.TouchableOpacity style={styles.addBtn} activeOpacity={0.7}>
          <vector_icons_1.Ionicons name="add-circle-outline" size={20} color={theme_1.colors.textMutedLight}/>
          <react_native_1.Text style={styles.addTxt}>Agregar ruta personalizada</react_native_1.Text>
        </react_native_1.TouchableOpacity>
      </react_native_1.ScrollView>

      {sel && (<react_native_1.View style={styles.footer}>
          <react_native_1.TouchableOpacity style={[styles.verBtn, { backgroundColor: sel.color }]} onPress={verMapa} activeOpacity={0.9}>
            <react_native_1.Text style={styles.verTxt}>Ver mapa — {sel.nombre}</react_native_1.Text>
          </react_native_1.TouchableOpacity>
        </react_native_1.View>)}
    </react_native_safe_area_context_1.SafeAreaView>);
}
function Meta({ icon, text, strong, color }) {
    return (<react_native_1.View style={styles.meta}>
      <vector_icons_1.Ionicons name={icon} size={15} color={color ?? theme_1.colors.textMutedLight}/>
      <react_native_1.Text style={[styles.metaTxt, strong && { fontWeight: '800', color: color ?? theme_1.colors.textLight }]}>{text}</react_native_1.Text>
    </react_native_1.View>);
}
const styles = react_native_1.StyleSheet.create({
    root: { flex: 1, backgroundColor: theme_1.colors.navy },
    step: { color: theme_1.colors.yellow, fontWeight: '800', fontSize: 13, letterSpacing: 1 },
    title: { color: theme_1.colors.white, fontSize: 30, fontWeight: '900', marginTop: 6, letterSpacing: -0.5 },
    subtitle: { color: theme_1.colors.textMutedLight, fontSize: 15, marginTop: 6, marginBottom: 18 },
    card: { backgroundColor: theme_1.colors.navyCard, borderRadius: theme_1.radius.lg, padding: 16, marginBottom: 14, borderWidth: 1.5, borderColor: 'transparent' },
    cardTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    icon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
    name: { color: theme_1.colors.white, fontSize: 19, fontWeight: '800' },
    badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8 },
    badgeTxt: { fontSize: 12, fontWeight: '700' },
    route: { color: theme_1.colors.textMutedLight, fontSize: 14, marginTop: 3 },
    check: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 10 },
    meta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    metaTxt: { color: theme_1.colors.textMutedLight, fontSize: 13 },
    sep: { width: 1, height: 14, backgroundColor: theme_1.colors.navyBorder },
    progressBlock: { marginTop: 16, borderTopWidth: 1, borderTopColor: theme_1.colors.navyBorder, paddingTop: 16 },
    progressLine: { flexDirection: 'row', alignItems: 'center' },
    dot: { width: 11, height: 11, borderRadius: 6 },
    bar: { flex: 1, height: 4, borderRadius: 2, marginHorizontal: 4 },
    progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
    progressTxt: { fontSize: 13, fontWeight: '700' },
    addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: theme_1.colors.navyBorder, borderStyle: 'dashed', borderRadius: theme_1.radius.lg, paddingVertical: 18, marginTop: 4 },
    addTxt: { color: theme_1.colors.textMutedLight, fontSize: 15, fontWeight: '600' },
    footer: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: theme_1.colors.navy, borderTopWidth: 1, borderTopColor: theme_1.colors.navyBorder },
    verBtn: { borderRadius: theme_1.radius.md, paddingVertical: 17, alignItems: 'center' },
    verTxt: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
//# sourceMappingURL=RouteSelectScreen.js.map