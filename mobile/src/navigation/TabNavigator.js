import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen        from '../screens/HomeScreen';
import SolicitudesScreen from '../screens/SolicitudesScreen';
import PerfilScreen      from '../screens/PerfilScreen';

const Tab = createBottomTabNavigator();

const ICONOS = {
  Inicio:      { activo: 'home',          inactivo: 'home-outline' },
  Solicitudes: { activo: 'document-text', inactivo: 'document-text-outline' },
  Perfil:      { activo: 'person',        inactivo: 'person-outline' },
};

export default function TabNavigator() {
  // Obtengo el inset inferior del dispositivo para que la tab bar no quede
  // tapada por los botones de navegación del sistema en modo edge-to-edge
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      id="TabsPrincipal"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   '#16A34A',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor:  '#E5E7EB',
          borderTopWidth:  1,
          height:          62 + insets.bottom,
          paddingBottom:   8 + insets.bottom,
          paddingTop:      4,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          const icono  = ICONOS[route.name];
          const nombre = focused ? icono.activo : icono.inactivo;
          return <Ionicons name={nombre} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio"       component={HomeScreen} />
      <Tab.Screen name="Solicitudes"  component={SolicitudesScreen} />
      <Tab.Screen name="Perfil"       component={PerfilScreen} />
    </Tab.Navigator>
  );
}
