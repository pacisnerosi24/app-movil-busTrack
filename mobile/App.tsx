import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import MainTabs from './src/navigation/MainTabs';
import { AppProvider } from './src/AppContext';
import { Usuario } from './src/api';

type Sesion = { token: string; usuario: Usuario } | null;

export default function App() {
  const [sesion, setSesion] = useState<Sesion>(null);
  const [authScreen, setAuthScreen] = useState<'login' | 'registro'>('login');

  const entrar = (token: string, usuario: Usuario) => setSesion({ token, usuario });

  return (
    <SafeAreaProvider>
      <StatusBar style={sesion ? 'dark' : 'light'} />
      {sesion ? (
        <AppProvider token={sesion.token} usuario={sesion.usuario} onLogout={() => setSesion(null)}>
          <NavigationContainer>
            <MainTabs />
          </NavigationContainer>
        </AppProvider>
      ) : authScreen === 'login' ? (
        <LoginScreen onLogin={entrar} onIrARegistro={() => setAuthScreen('registro')} />
      ) : (
        <RegisterScreen onRegistrado={entrar} onVolver={() => setAuthScreen('login')} />
      )}
    </SafeAreaProvider>
  );
}
