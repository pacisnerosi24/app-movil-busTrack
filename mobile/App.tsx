import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from './src/screens/LoginScreen';
import MainTabs from './src/navigation/MainTabs';
import { AppProvider } from './src/AppContext';
import { Usuario } from './src/api';
import { initApiBase } from './src/config';
import { colors } from './src/theme';

type Sesion = { token: string; usuario: Usuario } | null;

export default function App() {
  const [sesion, setSesion] = useState<Sesion>(null);
  const [configReady, setConfigReady] = useState(false);

  useEffect(() => {
    initApiBase().finally(() => setConfigReady(true));
  }, []);

  if (!configReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.yellow} />
        <Text style={styles.loadingText}>Cargando configuración...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={sesion ? 'dark' : 'light'} />
      {sesion ? (
        <AppProvider token={sesion.token} usuario={sesion.usuario} onLogout={() => setSesion(null)}>
          <NavigationContainer>
            <MainTabs />
          </NavigationContainer>
        </AppProvider>
      ) : (
        <LoginScreen onLogin={(token, usuario) => setSesion({ token, usuario })} />
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingText: { color: colors.textMutedLight, fontSize: 15 },
});
