import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen       from '../screens/HomeScreen';
import SolicitudesScreen from '../screens/SolicitudesScreen';
import PerfilScreen     from '../screens/PerfilScreen';

const Tab = createBottomTabNavigator();

// Ícono de cada tab: nombre del ícono cuando está activo e inactivo
const ICONOS = {
  Inicio:      { activo: 'home',          inactivo: 'home-outline' },
  Solicitudes: { activo: 'document-text', inactivo: 'document-text-outline' },
  Perfil:      { activo: 'person',        inactivo: 'person-outline' },
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        // Color del ícono y texto según si está activo o no
        tabBarActiveTintColor:   '#16A34A',
        tabBarInactiveTintColor: '#9CA3AF',

        // Estilo de la barra
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor:  '#E5E7EB',
          borderTopWidth:  1,
          height:          62,
          paddingBottom:   8,
          paddingTop:      4,
        },

        tabBarLabelStyle: {
          fontSize:   11,
          fontWeight: '600',
        },

        // Ícono de cada tab
        tabBarIcon: ({ focused, color, size }) => {
          const icono = ICONOS[route.name];
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
