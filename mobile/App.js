import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen          from './src/screens/LoginScreen';
import RegisterScreen       from './src/screens/RegisterScreen';
import TabNavigator         from './src/navigation/TabNavigator';
import PerfilTecnicoScreen  from './src/screens/PerfilTecnicoScreen';
import CrearSolicitudScreen from './src/screens/CrearSolicitudScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login"           component={LoginScreen} />
          <Stack.Screen name="Registro"        component={RegisterScreen} />
          <Stack.Screen name="Tabs"            component={TabNavigator} />
          <Stack.Screen name="PerfilTecnico"   component={PerfilTecnicoScreen} />
          <Stack.Screen name="CrearSolicitud"  component={CrearSolicitudScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
