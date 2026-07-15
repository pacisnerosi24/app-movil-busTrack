import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SosScreen from '../screens/SosScreen';
import AudioDetectionScreen from '../seguridad/screens/AudioDetectionScreen';

const Stack = createNativeStackNavigator();

export default function SosStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SosPrincipal" component={SosScreen} />
      <Stack.Screen name="DeteccionAudio" component={AudioDetectionScreen} />
    </Stack.Navigator>
  );
}
