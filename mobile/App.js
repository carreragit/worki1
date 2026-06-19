import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';

// Hace que Alert.alert funcione en la versión web mostrando un modal propio
// con los estilos de la app (ver el archivo para el detalle).
import { DialogoHost } from './src/utils/alertaWeb';
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

  // Cargamos nuestra copia de los iconos (assets/fonts) para que funcione en el deploy web.
  const [fuentesListas] = useFonts({ Ionicons: require('./assets/fonts/Ionicons.ttf') });

  if (rutaInicial === null || !fuentesListas) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        id="StackPrincipal"
        initialRouteName={rutaInicial}
        // cardStyle flex:1 acota cada pantalla a la altura del viewport en web.
        // Sin esto, el card del stack usa min-height:100% y crece con el
        // contenido, desbordando la pantalla sin permitir scroll.
        screenOptions={{ headerShown: false, cardStyle: { flex: 1 } }}
      >
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
        {/* Host del modal de Alert.alert para web; en móvil no renderiza nada. */}
        <DialogoHost />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
