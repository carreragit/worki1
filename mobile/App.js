import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import TabNavigator from './src/navigation/TabNavigator';
import PerfilTecnicoScreen from './src/screens/PerfilTecnicoScreen';
import CrearSolicitudScreen from './src/screens/CrearSolicitudScreen';

// ── IMPORTAMOS TUS PANTALLAS NUEVAS ──
import WorkerProfileScreen from './src/screens/WorkerProfileScreen';
import ClientProfileScreen from './src/screens/ClientProfileScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>

        {/* ── ATAJO TEMPORAL PARA LA PRUEBA (Muestra el perfil directo) ── */}
        <WorkerProfileScreen />

        {/* ── NAVEGACIÓN ORIGINAL COMENTADA (Descomentar después de la prueba) ── */}
        {/*
        <NavigationContainer>
          <Stack.Navigator id="StackPrincipal" initialRouteName="Login" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login"           component={LoginScreen} />
            <Stack.Screen name="Registro"        component={RegisterScreen} />
            <Stack.Screen name="Tabs"            component={TabNavigator} />
            <Stack.Screen name="PerfilTecnico"   component={PerfilTecnicoScreen} />
            <Stack.Screen name="CrearSolicitud"  component={CrearSolicitudScreen} />
          </Stack.Navigator>
        </NavigationContainer>
        */}

      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}