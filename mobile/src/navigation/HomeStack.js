"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HomeStack;
const native_stack_1 = require("@react-navigation/native-stack");
const RouteSelectScreen_1 = __importDefault(require("../screens/RouteSelectScreen"));
const MapScreen_1 = __importDefault(require("../screens/MapScreen"));
const Stack = (0, native_stack_1.createNativeStackNavigator)();
function HomeStack() {
    return (<Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SeleccionRuta" component={RouteSelectScreen_1.default}/>
      <Stack.Screen name="Mapa" component={MapScreen_1.default}/>
    </Stack.Navigator>);
}
//# sourceMappingURL=HomeStack.js.map