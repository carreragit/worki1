import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { UserProvider } from './src/context/UserContext';
import LoginScreen          from './src/screens/LoginScreen';
import RegisterScreen       from './src/screens/RegisterScreen';
import TabNavigator         from './src/navigation/TabNavigator';
import PerfilTecnicoScreen  from './src/screens/PerfilTecnicoScreen';
import CrearSolicitudScreen      from './src/screens/CrearSolicitudScreen';
import ActivarTrabajadorScreen  from './src/screens/ActivarTrabajadorScreen';
import DetalleSolicitudScreen   from './src/screens/DetalleSolicitudScreen';
import CalificarScreen          from './src/screens/CalificarScreen';
// Pantalla de chat en tiempo real entre cliente y trabajador (Task 1)
import ChatScreen               from './src/screens/ChatScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <UserProvider>
          <NavigationContainer>
            <Stack.Navigator id="StackPrincipal" initialRouteName="Login" screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Login"           component={LoginScreen} />
              <Stack.Screen name="Registro"        component={RegisterScreen} />
              <Stack.Screen name="Tabs"            component={TabNavigator} />
              <Stack.Screen name="PerfilTecnico"   component={PerfilTecnicoScreen} />
              <Stack.Screen name="CrearSolicitud"     component={CrearSolicitudScreen} />
              <Stack.Screen name="ActivarTrabajador"  component={ActivarTrabajadorScreen} />
              <Stack.Screen name="DetalleSolicitud"   component={DetalleSolicitudScreen} />
              <Stack.Screen name="Calificar"          component={CalificarScreen} />
              {/* Ruta de chat: accesible desde DetalleSolicitudScreen cuando estado === ACEPTADA (Task 1) */}
              <Stack.Screen name="Chat"               component={ChatScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </UserProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}