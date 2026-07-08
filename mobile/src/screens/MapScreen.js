"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MapScreen;
const react_1 = require("react");
const react_native_1 = require("react-native");
const react_native_safe_area_context_1 = require("react-native-safe-area-context");
const react_native_webview_1 = require("react-native-webview");
const vector_icons_1 = require("@expo/vector-icons");
const api_1 = require("../api");
const mapHtml_1 = require("../mapHtml");
const config_1 = require("../config");
const AppContext_1 = require("../AppContext");
const theme_1 = require("../theme");
function MapScreen({ navigation }) {
    const { token, rutaSeleccionada } = (0, AppContext_1.useApp)();
    const [simulando, setSimulando] = (0, react_1.useState)(false);
    const [wsOk, setWsOk] = (0, react_1.useState)(false);
    const [enVivo, setEnVivo] = (0, react_1.useState)(false);
    const posRef = (0, react_1.useRef)({ lat: -2.170998, lng: -79.922359 });
    const timerRef = (0, react_1.useRef)(null);
    const ruta = rutaSeleccionada;
    (0, react_1.useEffect)(() => () => { if (timerRef.current)
        clearInterval(timerRef.current); }, []);
    if (!ruta) {
        return (<react_native_1.View style={styles.empty}>
        <vector_icons_1.MaterialCommunityIcons name="bus-alert" size={54} color={theme_1.colors.textMutedDark}/>
        <react_native_1.Text style={styles.emptyTxt}>No has seleccionado una ruta</react_native_1.Text>
        <react_native_1.TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('SeleccionRuta')}>
          <react_native_1.Text style={styles.emptyBtnTxt}>Elegir ruta</react_native_1.Text>
        </react_native_1.TouchableOpacity>
      </react_native_1.View>);
    }
    async function tick() {
        posRef.current.lat += (Math.random() - 0.35) * 0.0009;
        posRef.current.lng += (Math.random() - 0.35) * 0.0009;
        try {
            await (0, api_1.enviarUbicacion)(token, ruta.idBus, posRef.current.lat, posRef.current.lng);
        }
        catch { }
    }
    function toggleSim() {
        if (simulando) {
            if (timerRef.current)
                clearInterval(timerRef.current);
            timerRef.current = null;
            setSimulando(false);
        }
        else {
            setSimulando(true);
            tick();
            timerRef.current = setInterval(tick, 2000);
        }
    }
    function onMessage(raw) {
        try {
            const m = JSON.parse(raw);
            if (m.type === 'ws')
                setWsOk(!!m.connected);
            if (m.type === 'pos')
                setEnVivo(true);
        }
        catch { }
    }
    return (<react_native_1.View style={styles.root}>
      <react_native_webview_1.WebView style={react_native_1.StyleSheet.absoluteFill} originWhitelist={['*']} source={{ html: (0, mapHtml_1.buildMapHtml)(config_1.API_BASE, ruta.idBus, ruta.color) }} onMessage={(e) => onMessage(e.nativeEvent.data)} javaScriptEnabled domStorageEnabled mixedContentMode="always" startInLoadingState renderLoading={() => (<react_native_1.View style={styles.loading}><react_native_1.ActivityIndicator size="large" color={ruta.color}/></react_native_1.View>)}/>

      
      <react_native_safe_area_context_1.SafeAreaView edges={['top']} style={styles.topOverlay} pointerEvents="box-none">
        <react_native_1.View style={styles.pill}>
          <react_native_1.View style={[styles.pillDot, { backgroundColor: enVivo ? theme_1.colors.green : theme_1.colors.textMutedDark }]}/>
          <react_native_1.Text style={styles.pillTxt}>{enVivo ? 'En camino' : wsOk ? 'Esperando GPS…' : 'Conectando…'}</react_native_1.Text>
        </react_native_1.View>
      </react_native_safe_area_context_1.SafeAreaView>

      
      <react_native_1.View style={styles.card}>
        <react_native_1.View style={{ flex: 1 }}>
          <react_native_1.View style={styles.cardHeader}>
            <react_native_1.View style={[styles.cardDot, { backgroundColor: ruta.color }]}/>
            <react_native_1.Text style={styles.cardRoute} numberOfLines={1}>{ruta.nombre} — {ruta.etiqueta}</react_native_1.Text>
            <react_native_1.TouchableOpacity style={styles.cambiar} onPress={() => navigation.navigate('SeleccionRuta')}>
              <vector_icons_1.Ionicons name="arrow-back" size={13} color={ruta.color}/>
              <react_native_1.Text style={[styles.cambiarTxt, { color: ruta.color }]}>Cambiar</react_native_1.Text>
            </react_native_1.TouchableOpacity>
          </react_native_1.View>
          <react_native_1.Text style={styles.etaLabel}>Llegará en:</react_native_1.Text>
          <react_native_1.Text style={styles.eta}>{ruta.minutos} min</react_native_1.Text>
          <react_native_1.View style={styles.tag}><react_native_1.Text style={styles.tagTxt}>{ruta.tipoBus}</react_native_1.Text></react_native_1.View>
        </react_native_1.View>

        
        <react_native_1.TouchableOpacity style={[styles.busBtn, { backgroundColor: simulando ? theme_1.colors.red : ruta.color }]} onPress={toggleSim} activeOpacity={0.85}>
          <vector_icons_1.MaterialCommunityIcons name={simulando ? 'stop' : 'bus'} size={30} color="#fff"/>
          <react_native_1.Text style={styles.busBtnTxt}>{simulando ? 'Detener' : 'Simular'}</react_native_1.Text>
        </react_native_1.TouchableOpacity>
      </react_native_1.View>
    </react_native_1.View>);
}
const styles = react_native_1.StyleSheet.create({
    root: { flex: 1, backgroundColor: theme_1.colors.lightBg },
    loading: { ...react_native_1.StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: theme_1.colors.lightBg },
    topOverlay: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 16 },
    pill: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', backgroundColor: theme_1.colors.navy, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, marginTop: 8 },
    pillDot: { width: 9, height: 9, borderRadius: 5 },
    pillTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },
    card: { position: 'absolute', left: 14, right: 14, bottom: 16, backgroundColor: '#fff', borderRadius: theme_1.radius.lg, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 7 },
    cardDot: { width: 9, height: 9, borderRadius: 5 },
    cardRoute: { color: theme_1.colors.textDark, fontWeight: '800', fontSize: 15, flex: 1 },
    cambiar: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: theme_1.colors.lightBg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    cambiarTxt: { fontWeight: '800', fontSize: 12 },
    etaLabel: { color: theme_1.colors.textMutedDark, fontSize: 14, marginTop: 8 },
    eta: { color: theme_1.colors.green, fontSize: 34, fontWeight: '900', marginTop: 2 },
    tag: { alignSelf: 'flex-start', backgroundColor: theme_1.colors.orangeSoft, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, marginTop: 8 },
    tagTxt: { color: theme_1.colors.orange, fontWeight: '700', fontSize: 13 },
    busBtn: { width: 78, height: 78, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    busBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 12, marginTop: 2 },
    empty: { flex: 1, backgroundColor: theme_1.colors.lightBg, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 30 },
    emptyTxt: { color: theme_1.colors.textMutedDark, fontSize: 16, fontWeight: '600' },
    emptyBtn: { backgroundColor: theme_1.colors.yellow, paddingHorizontal: 24, paddingVertical: 14, borderRadius: theme_1.radius.md },
    emptyBtnTxt: { color: theme_1.colors.navy, fontWeight: '800', fontSize: 15 },
});
//# sourceMappingURL=MapScreen.js.map