import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HomeStack from './HomeStack';
import SosScreen from '../screens/SosScreen';
import ReportsScreen from '../screens/ReportsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

function TabIcon({ focused, name }: { focused: boolean; name: any }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Ionicons name={name} size={22} color={focused ? colors.white : colors.textMutedDark} />
    </View>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMutedDark,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700', marginTop: 2 },
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: { paddingVertical: 8 },
      }}
    >
      <Tab.Screen
        name="Inicio"
        component={HomeStack}
        options={({ route }) => {
          // Oculta la barra en la pantalla de selección de ruta (pantalla completa)
          const r = getFocusedRouteNameFromRoute(route) ?? 'SeleccionRuta';
          return {
            tabBarStyle: r === 'SeleccionRuta' ? { display: 'none' } : styles.tabBar,
            tabBarIcon: ({ focused }) => <TabIcon focused={focused} name={focused ? 'home' : 'home-outline'} />,
          };
        }}
      />
      <Tab.Screen
        name="SOS"
        component={SosScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="alert" /> }}
      />
      <Tab.Screen
        name="Reportes"
        component={ReportsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} name={focused ? 'menu' : 'reorder-three-outline'} /> }}
      />
      <Tab.Screen
        name="Ajustes"
        component={SettingsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} name={focused ? 'settings' : 'settings-outline'} /> }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
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
  iconWrapActive: { backgroundColor: colors.primary },
});
