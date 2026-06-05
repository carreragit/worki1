/**
 * PerfilTecnicoScreen
 *
 * Muestra el perfil completo de un trabajador con tres pestañas:
 *   - Información: descripción del servicio principal.
 *   - Servicios: lista de todos los oficios del trabajador (cargados frescos del backend).
 *   - Reseñas: calificaciones recibidas del interaction-service.
 *
 * Por qué useFocusEffect en lugar de useEffect:
 *   Si el cliente califica al técnico y vuelve a esta pantalla con el botón atrás,
 *   useFocusEffect recargará los datos y mostrará el nuevo promedio actualizado.
 *
 * Por qué oficioActual en lugar de oficio (route.params):
 *   El objeto `oficio` que llega por parámetro puede tener datos desactualizados
 *   (guardado en el estado de HomeScreen). oficioActual se obtiene de la lista
 *   recargada del backend, garantizando que el rating y el contador de reseñas
 *   sean los valores más recientes.
 */
// mobile/src/screens/PerfilTecnicoScreen.js
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { getToken } from '../services/authService';
import { listarPorTrabajador } from '../services/calificacionService';
import { COLORS, AVATAR_COLORS } from '../theme';

const GATEWAY_URL = 'http://192.168.1.102:8080';
const TABS = ['Información', 'Servicios', 'Reseñas'];

export default function PerfilTecnicoScreen({ route, navigation }) {
  const { oficio } = route.params;
  const [tabActivo, setTabActivo] = useState('Información');
  const [oficios, setOficios] = useState([oficio]);
  const [cargando, setCargando] = useState(true);
  const [resenas, setResenas] = useState([]);

  // Recarga datos cada vez que la pantalla gana foco (no solo al montar el componente)
  useFocusEffect(useCallback(() => {
    cargarOficios();
    void cargarResenas();
  }, []));

  const cargarResenas = async () => {
    try {
      const data = await listarPorTrabajador(oficio.trabajadorId);
      setResenas(data);
    } catch {
      // silencioso
    }
  };

  const cargarOficios = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(
        `${GATEWAY_URL}/api/oficios/trabajador/${oficio.trabajadorId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOficios(res.data);
    } catch {
      // Si falla la carga, se mantiene el oficio inicial que vino por parámetro
    } finally {
      setCargando(false);
    }
  };

  // oficioActual tiene los datos frescos del backend (rating y reseñas actualizados).
  // Se busca por id para encontrar el mismo oficio que se estaba viendo;
  // si por alguna razón no está en la lista, se usa el primero disponible o el parámetro original.
  const oficioActual = oficios.find(o => o.id === oficio.id) ?? oficios[0] ?? oficio;
  const color = AVATAR_COLORS[oficio.trabajadorId % AVATAR_COLORS.length];
  const iniciales = oficio.nombreTrabajador
    ? oficio.nombreTrabajador.trim().split(' ').slice(0, 2).map(p => p[0].toUpperCase()).join('')
    : '?';

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btnAtras}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Perfil del técnico</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.perfilBloque}>
          <View style={[styles.avatar, { backgroundColor: color }]}>
            <Text style={styles.avatarTexto}>{iniciales}</Text>
          </View>
          <Text style={styles.nombre}>{oficio.nombreTrabajador ?? 'Técnico'}</Text>
          <Text style={styles.oficio}>{oficioActual.especialidad ?? oficio.especialidad}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValor}>★ {oficioActual.promedioCalificacion?.toFixed(1) ?? 'N/A'}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.separador} />
            <View style={styles.statItem}>
              <Text style={styles.statValor}>{oficioActual.totalCalificaciones ?? 0}</Text>
              <Text style={styles.statLabel}>Reseñas</Text>
            </View>
            <View style={styles.separador} />
            <View style={styles.statItem}>
              <Text style={styles.statValor}>{oficio.radioKm ?? '?'} km</Text>
              <Text style={styles.statLabel}>Radio</Text>
            </View>
          </View>
        </View>

        <View style={styles.tabsRow}>
          {TABS.map(tab => (
            <TouchableOpacity key={tab} onPress={() => setTabActivo(tab)}
              style={[styles.tab, tabActivo === tab && styles.tabActivo]}>
              <Text style={[styles.tabTexto, tabActivo === tab && styles.tabTextoActivo]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tabContenido}>
          {tabActivo === 'Información' && (
            <>
              <Text style={styles.seccionTitulo}>DESCRIPCIÓN DEL SERVICIO</Text>
              <Text style={styles.descripcionTexto}>
                {oficio.descripcionServicio ?? `Servicio profesional de ${oficio.especialidad?.toLowerCase()}.`}
              </Text>
            </>
          )}
          {tabActivo === 'Servicios' && (
            <>
              <Text style={styles.seccionTitulo}>SERVICIOS OFRECIDOS</Text>
              {cargando ? <ActivityIndicator color={COLORS.primary} /> : oficios.map(o => (
                <View key={o.id} style={styles.servicioItem}>
                  <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.primary} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.servicioNombre}>{o.nombreServicio ?? o.especialidad}</Text>
                    {o.tarifaServicioBase && (
                      <Text style={styles.servicioTarifa}>Desde ${o.tarifaServicioBase.toLocaleString()}</Text>
                    )}
                  </View>
                </View>
              ))}
            </>
          )}
          {tabActivo === 'Reseñas' && (
            <>
              <Text style={styles.seccionTitulo}>RESEÑAS RECIBIDAS</Text>
              {resenas.length === 0 ? (
                <Text style={styles.descripcionTexto}>Este técnico aún no tiene reseñas.</Text>
              ) : (
                resenas.map(r => (
                  <View key={r.id} style={styles.resenaCard}>
                    <View style={styles.resenaHeader}>
                      <Text style={styles.resenaNombre}>{r.nombreEvaluador ?? 'Cliente'}</Text>
                      <Text style={styles.resenaEstrellas}>{'★'.repeat(r.puntaje)}{'☆'.repeat(5 - r.puntaje)}</Text>
                    </View>
                    {r.comentario ? (
                      <Text style={styles.resenaTexto}>{r.comentario}</Text>
                    ) : null}
                    <Text style={styles.resenaFecha}>
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}
                    </Text>
                  </View>
                ))
              )}
            </>
          )}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.btnContactar} activeOpacity={0.85}
          onPress={() => navigation.navigate('CrearSolicitud', { oficio: oficioActual, oficios })}>
          <Text style={styles.btnContactarTexto}>
            Contactar a {(oficio.nombreTrabajador ?? 'Técnico').split(' ')[0]}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORS.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  btnAtras: { padding: 4 },
  headerTitulo: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary },
  perfilBloque: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarTexto: { color: COLORS.surface, fontSize: 24, fontWeight: '700' },
  nombre: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  oficio: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 16 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  statItem: { alignItems: 'center' },
  statValor: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  statLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  separador: { width: 1, height: 30, backgroundColor: COLORS.border },
  tabsRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActivo: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabTexto: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  tabTextoActivo: { color: COLORS.primary },
  tabContenido: { padding: 20 },
  seccionTitulo: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 0.8, marginBottom: 12 },
  descripcionTexto: { fontSize: 14, color: COLORS.textLight, lineHeight: 22 },
  servicioItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  servicioNombre: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '600' },
  servicioTarifa: { fontSize: 12, color: COLORS.primary, marginTop: 2 },
  footer: { paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.surface },
  btnContactar: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  btnContactarTexto: { color: COLORS.surface, fontSize: 16, fontWeight: '700' },
  resenaCard: {
    backgroundColor: COLORS.background, borderRadius: 12, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: COLORS.borderLight,
  },
  resenaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  resenaNombre: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  resenaEstrellas: { fontSize: 14, color: COLORS.warning },
  resenaTexto: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 4 },
  resenaFecha: { fontSize: 11, color: COLORS.textMuted },
});
