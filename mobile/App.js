import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { UserProvider }            from './src/context/UserContext';
import LoginScreen                 from './src/screens/LoginScreen';
import RegisterScreen              from './src/screens/RegisterScreen';
import TabNavigator                from './src/navigation/TabNavigator';
import PerfilTecnicoScreen         from './src/screens/PerfilTecnicoScreen';
import CrearSolicitudScreen        from './src/screens/CrearSolicitudScreen';
import ActivarTrabajadorScreen     from './src/screens/ActivarTrabajadorScreen';
import DetalleSolicitudScreen      from './src/screens/DetalleSolicitudScreen';
import CalificarScreen             from './src/screens/CalificarScreen';
import ChatScreen                  from './src/screens/ChatScreen';
import WorkerProfileScreen         from './src/screens/WorkerProfileScreen';
import ClientProfileScreen         from './src/screens/ClientProfileScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <UserProvider>
          <NavigationContainer>
            <Stack.Navigator id="StackPrincipal" initialRouteName="Login" screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Login"             component={LoginScreen} />
              <Stack.Screen name="Registro"          component={RegisterScreen} />
              <Stack.Screen name="Tabs"              component={TabNavigator} />
              <Stack.Screen name="PerfilTecnico"     component={PerfilTecnicoScreen} />
              <Stack.Screen name="CrearSolicitud"    component={CrearSolicitudScreen} />
              <Stack.Screen name="ActivarTrabajador" component={ActivarTrabajadorScreen} />
              <Stack.Screen name="DetalleSolicitud"  component={DetalleSolicitudScreen} />
              <Stack.Screen name="Calificar"         component={CalificarScreen} />
              <Stack.Screen name="Chat"              component={ChatScreen} />
              <Stack.Screen name="PerfilTrabajador"  component={WorkerProfileScreen} />
              <Stack.Screen name="PerfilCliente"     component={ClientProfileScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </UserProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}