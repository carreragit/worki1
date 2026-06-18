import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';

import { UserProvider, useUser } from './src/context/UserContext';
import LoginScreen              from './src/screens/LoginScreen';
import RegisterScreen           from './src/screens/RegisterScreen';
import TabNavigator             from './src/navigation/TabNavigator';
import PerfilTecnicoScreen      from './src/screens/PerfilTecnicoScreen';
import CrearSolicitudScreen     from './src/screens/CrearSolicitudScreen';
import ActivarTrabajadorScreen  from './src/screens/ActivarTrabajadorScreen';
import DetalleSolicitudScreen   from './src/screens/DetalleSolicitudScreen';
import CalificarScreen          from './src/screens/CalificarScreen';
import ChatScreen               from './src/screens/ChatScreen';
import RecuperarPasswordScreen  from './src/screens/RecuperarPasswordScreen';
import ResetPasswordScreen      from './src/screens/ResetPasswordScreen';

const Stack = createStackNavigator();

// Separado en componente propio para poder usar useUser() dentro del UserProvider
function AppNavigator() {
  const { rutaInicial } = useUser();

  // Dispara la carga de la fuente Ionicons en segundo plano.
  // No bloqueamos el render — la app se muestra de inmediato y los iconos
  // aparecen en cuanto la fuente descarga.
  //
  // IMPORTANTE (build de Cloudflare): cargamos la fuente desde una copia propia
  // en assets/fonts/ en vez de usar Ionicons.font. Ionicons.font apunta al .ttf
  // dentro de node_modules, y Expo lo exporta a dist/assets/node_modules/...
  // Cloudflare Pages NO publica ninguna ruta que contenga "node_modules"
  // (la redirige a /), por lo que ese .ttf daba 404 en producción y los iconos
  // se veían como cuadrados blancos. Sirviéndolo desde assets/fonts/ la ruta
  // exportada queda fuera de node_modules y Cloudflare sí la publica.
  useFonts({ Ionicons: require('./assets/fonts/Ionicons.ttf') });

  if (rutaInicial === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator id="StackPrincipal" initialRouteName={rutaInicial} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login"              component={LoginScreen} />
        <Stack.Screen name="Registro"           component={RegisterScreen} />
        <Stack.Screen name="Tabs"               component={TabNavigator} />
        <Stack.Screen name="PerfilTecnico"      component={PerfilTecnicoScreen} />
        <Stack.Screen name="CrearSolicitud"     component={CrearSolicitudScreen} />
        <Stack.Screen name="ActivarTrabajador"  component={ActivarTrabajadorScreen} />
        <Stack.Screen name="DetalleSolicitud"   component={DetalleSolicitudScreen} />
        <Stack.Screen name="Calificar"          component={CalificarScreen} />
        <Stack.Screen name="Chat"               component={ChatScreen} />
        {/* Rutas de recuperación de contraseña: accesibles desde LoginScreen sin autenticación */}
        <Stack.Screen name="RecuperarPassword"  component={RecuperarPasswordScreen} />
        <Stack.Screen name="ResetPassword"      component={ResetPasswordScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" translucent backgroundColor="transparent" />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <UserProvider>
          <AppNavigator />
        </UserProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
