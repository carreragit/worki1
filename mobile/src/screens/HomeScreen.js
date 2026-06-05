/**
 * HomeScreen
 *
 * Pantalla principal del tab navigator. Muestra los técnicos disponibles cerca
 * del usuario, usando GPS para calcular la distancia (Haversine en el backend).
 *
 * Flujo al abrir la pantalla:
 *   1. Pide permiso de ubicación.
 *   2. Obtiene las coordenadas actuales.
 *   3. Llama al endpoint /api/oficios/mapa con lat, lon y radioKm.
 *   4. Muestra las tarjetas de técnicos filtradas por búsqueda y categoría.
 *
 * Usa useFocusEffect (en lugar de useEffect) para recargar los técnicos cada
 * vez que el usuario vuelve a esta pestaña, por ejemplo después de calificar
 * a un trabajador para que el rating actualizado sea visible de inmediato.
 */
// mobile/src/screens/HomeScreen.js
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, StatusBar,
  ActivityIndicator, Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { getToken } from '../services/authService';
import { COLORS, AVATAR_COLORS } from '../theme';

import { GATEWAY_URL } from '../services/config';
const CATEGORIAS = ['Todos', 'Electricista', 'Gasfiter', 'Pintor', 'Cerrajero', 'Cuidador'];

function colorPorId(id) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function inicialesDe(nombre) {
  if (!nombre) return '?';
  const partes = nombre.trim().split(' ');
  return partes.length >= 2
    ? partes[0][0].toUpperCase() + partes[1][0].toUpperCase()
    : partes[0][0].toUpperCase();
}

function CategoryChip({ label, active, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}
      style={[styles.chip, active ? styles.chipActivo : styles.chipInactivo]}>
      <Text style={[styles.chipTexto, active ? styles.chipTextoActivo : styles.chipTextoInactivo]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function WorkerCard({ oficio, onPress }) {
  const color = colorPorId(oficio.trabajadorId);
  const iniciales = inicialesDe(oficio.nombreTrabajador);
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.card}>
      <View style={[styles.avatar, { backgroundColor: color }]}>
        <Text style={styles.avatarTexto}>{iniciales}</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardNombre}>{oficio.nombreTrabajador ?? 'Técnico'}</Text>
        <Text style={styles.cardOficio}>{oficio.especialidad}</Text>
        <Text style={styles.cardPrecio}>Desde ${oficio.tarifaServicioBase?.toLocaleString()}</Text>
      </View>
      <View style={styles.cardRating}>
        <Text style={styles.ratingTexto}>★ {oficio.promedioCalificacion?.toFixed(1) ?? 'N/A'}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const [oficios, setOficios]             = useState([]);
  const [busqueda, setBusqueda]           = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [cargando, setCargando]           = useState(true);
  const [ubicacion, setUbicacion]         = useState(null);
  const [errorUbicacion, setErrorUbicacion] = useState(false);

  // useFocusEffect: recarga los técnicos cada vez que el usuario vuelve a esta pestaña,
  // por ejemplo después de calificar a un trabajador para que el rating actualizado sea visible.
  useFocusEffect(useCallback(() => {
    if (ubicacion) {
      cargarOficios(ubicacion.latitude, ubicacion.longitude);
    } else {
      pedirUbicacionYCargar();
    }
  }, [ubicacion]));

  const pedirUbicacionYCargar = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorUbicacion(true);
      setCargando(false);
      return;
    }
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    setUbicacion(loc.coords);
    await cargarOficios(loc.coords.latitude, loc.coords.longitude);
  };

  const cargarOficios = async (lat, lon, categoria = categoriaActiva) => {
    setCargando(true);
    try {
      const token = await getToken();
      const especialidad = categoria !== 'Todos' ? categoria : undefined;
      const params = { latitud: lat, longitud: lon, radioKm: 10, ...(especialidad && { especialidad }) };
      const res = await axios.get(`${GATEWAY_URL}/api/oficios/mapa`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      setOficios(res.data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los técnicos.');
    } finally {
      setCargando(false);
    }
  };

  // Filtrado local sobre la lista ya cargada del backend
  // (la búsqueda por texto y las categorías se aplican en el cliente para evitar llamadas extra)
  const oficiosFiltrados = oficios.filter(o => {
    const matchBusqueda = !busqueda ||
      o.nombreTrabajador?.toLowerCase().includes(busqueda.toLowerCase()) ||
      o.especialidad?.toLowerCase().includes(busqueda.toLowerCase());
    const matchCategoria = categoriaActiva === 'Todos' ||
      o.especialidad?.toLowerCase().includes(categoriaActiva.toLowerCase());
    return matchBusqueda && matchCategoria;
  });

  if (errorUbicacion) {
    return (
      <SafeAreaView style={styles.centrado}>
        <Ionicons name="location-off-outline" size={48} color={COLORS.textMuted} />
        <Text style={styles.errorTexto}>Necesitamos tu ubicación para mostrarte técnicos cercanos.</Text>
        <TouchableOpacity style={styles.btnConfig} onPress={() => Linking.openSettings()}>
          <Text style={styles.btnConfigTexto}>Abrir configuración</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
        <Text style={styles.headerTitulo}>Worki</Text>
        <Text style={styles.headerSub}>Técnicos cerca de ti</Text>
        <View style={styles.buscadorContainer}>
          <Ionicons name="search-outline" size={18} color={COLORS.textSecondary} style={{ marginLeft: 12 }} />
          <TextInput
            style={styles.buscador}
            placeholder="Buscar técnico o servicio..."
            placeholderTextColor={COLORS.textMuted}
            value={busqueda}
            onChangeText={setBusqueda}
          />
        </View>
      </LinearGradient>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={styles.categoriasScroll} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        {CATEGORIAS.map(cat => (
          <CategoryChip key={cat} label={cat} active={categoriaActiva === cat}
            onPress={() => {
              setCategoriaActiva(cat);
              if (ubicacion) cargarOficios(ubicacion.latitude, ubicacion.longitude, cat);
            }} />
        ))}
      </ScrollView>

      {cargando ? (
        <View style={styles.centrado}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ color: COLORS.textSecondary, marginTop: 8 }}>Buscando técnicos...</Text>
        </View>
      ) : oficiosFiltrados.length === 0 ? (
        <View style={styles.centrado}>
          <Ionicons name="people-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.errorTexto}>No hay técnicos disponibles en tu zona.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={styles.seccionTitulo}>
            {oficiosFiltrados.length} técnico{oficiosFiltrados.length !== 1 ? 's' : ''} disponible{oficiosFiltrados.length !== 1 ? 's' : ''}
          </Text>
          {oficiosFiltrados.map(oficio => (
            <WorkerCard
              key={oficio.id}
              oficio={oficio}
              onPress={() => navigation.navigate('PerfilTecnico', { oficio })}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 8, paddingBottom: 16, paddingHorizontal: 16 },
  headerTitulo: { color: COLORS.surface, fontSize: 26, fontWeight: '800' },
  headerSub: { color: COLORS.primaryBorder, fontSize: 13, marginBottom: 12 },
  buscadorContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 12, height: 44,
  },
  buscador: { flex: 1, paddingHorizontal: 10, fontSize: 14, color: COLORS.textPrimary },
  categoriasScroll: { maxHeight: 56, flexGrow: 0 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginRight: 8, borderWidth: 1 },
  chipActivo: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipInactivo: { backgroundColor: COLORS.surface, borderColor: COLORS.border },
  chipTexto: { fontSize: 13, fontWeight: '600' },
  chipTextoActivo: { color: COLORS.surface },
  chipTextoInactivo: { color: COLORS.textLight },
  seccionTitulo: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 0.5, marginBottom: 12 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: 14, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarTexto: { color: COLORS.surface, fontSize: 16, fontWeight: '700' },
  cardInfo: { flex: 1 },
  cardNombre: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  cardOficio: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  cardPrecio: { fontSize: 12, color: COLORS.primary, marginTop: 3, fontWeight: '600' },
  cardRating: { alignItems: 'center' },
  ratingTexto: { fontSize: 14, fontWeight: '700', color: COLORS.warning },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorTexto: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: 12, lineHeight: 22 },
  btnConfig: { marginTop: 16, backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  btnConfigTexto: { color: COLORS.surface, fontWeight: '700' },
});
