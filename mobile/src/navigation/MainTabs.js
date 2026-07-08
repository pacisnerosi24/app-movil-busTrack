"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MainTabs;
const bottom_tabs_1 = require("@react-navigation/bottom-tabs");
const native_1 = require("@react-navigation/native");
const react_native_1 = require("react-native");
const vector_icons_1 = require("@expo/vector-icons");
const HomeStack_1 = __importDefault(require("./HomeStack"));
const SosScreen_1 = __importDefault(require("../screens/SosScreen"));
const ReportsScreen_1 = __importDefault(require("../screens/ReportsScreen"));
const theme_1 = require("../theme");
const Tab = (0, bottom_tabs_1.createBottomTabNavigator)();
function TabIcon({ focused, name }) {
    return (<react_native_1.View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <vector_icons_1.Ionicons name={name} size={22} color={focused ? theme_1.colors.navy : theme_1.colors.textMutedDark}/>
    </react_native_1.View>);
}
function MainTabs() {
    return (<Tab.Navigator screenOptions={{
            headerShown: false,
            tabBarShowLabel: true,
            tabBarActiveTintColor: theme_1.colors.navy,
            tabBarInactiveTintColor: theme_1.colors.textMutedDark,
            tabBarLabelStyle: { fontSize: 12, fontWeight: '700', marginTop: 2 },
            tabBarStyle: styles.tabBar,
            tabBarItemStyle: { paddingVertical: 8 },
        }}>
      <Tab.Screen name="Inicio" component={HomeStack_1.default} options={({ route }) => {
            const r = (0, native_1.getFocusedRouteNameFromRoute)(route) ?? 'SeleccionRuta';
            return {
                tabBarStyle: r === 'SeleccionRuta' ? { display: 'none' } : styles.tabBar,
                tabBarIcon: ({ focused }) => <TabIcon focused={focused} name={focused ? 'home' : 'home-outline'}/>,
            };
        }}/>
      <Tab.Screen name="SOS" component={SosScreen_1.default} options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="alert"/> }}/>
      <Tab.Screen name="Reportes" component={ReportsScreen_1.default} options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} name={focused ? 'menu' : 'reorder-three-outline'}/> }}/>
    </Tab.Navigator>);
}
const styles = react_native_1.StyleSheet.create({
    tabBar: {
        height: 82,
        paddingTop: 8,
        backgroundColor: '#fff',
        borderTopWidth: 0,
        elevation: 12,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: -3 },
    },
    iconWrap: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
    iconWrapActive: { backgroundColor: theme_1.colors.yellow },
});
//# sourceMappingURL=MainTabs.js.map