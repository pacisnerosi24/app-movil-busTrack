import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RouteSelectScreen from '../screens/RouteSelectScreen';
import MapScreen from '../screens/MapScreen';

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SeleccionRuta" component={RouteSelectScreen} />
      <Stack.Screen name="Mapa" component={MapScreen} />
    </Stack.Navigator>
  );
}
