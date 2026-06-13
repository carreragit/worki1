/**
 * SolicitudesScreen
 *
 * Lista las solicitudes del usuario. Si el usuario es trabajador, muestra dos pestañas:
 *   - Enviadas: solicitudes que el usuario creó como cliente.
 *   - Recibidas: solicitudes que otros usuarios enviaron a este trabajador.
 * Si no es trabajador, solo muestra la lista de solicitudes enviadas.
 *
 * Usa useFocusEffect para recargar la lista cada vez que el usuario vuelve
 * a esta pantalla (por ejemplo, después de actualizar el estado de una solicitud
 * en DetalleSolicitudScreen), asegurando que los datos siempre estén frescos.
 *
 * Las tarjetas con estado ACEPTADA muestran un indicador "Chat activo" para
 * que el usuario sepa que puede abrir el chat desde el detalle.
 */
// mobile/src/screens/SolicitudesScreen.js
import { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { listarPorCliente, listarPorTrabajador } from '../services/solicitudService';
import { useUser } from '../context/UserContext';
import { COLORS, ESTADO_COLORS } from '../theme';

function SolicitudCard({ solicitud, modoTrabajador, onPress }) {
  const estado = ESTADO_COLORS[solicitud.estado] ?? ESTADO_COLORS.PENDIENTE;
  const nombreOtro = modoTrabajador ? solicitud.nombreCliente : solicitud.nombreTrabajador;
  const fecha = solicitud.createdAt
    ? new Date(solicitud.createdAt).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })
    : '';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardTop}>
        <Text style={styles.cardNombre}>{nombreOtro ?? 'Usuario'}</Text>
        <View style={[styles.estadoBadge, { backgroundColor: estado.bg }]}>
          <Text style={[styles.estadoTexto, { color: estado.text }]}>{solicitud.estado}</Text>
        </View>
      </View>
      {solicitud.nombreOficio && (
        <Text style={styles.cardOficio}>{solicitud.nombreOficio}</Text>
      )}
      <Text style={styles.cardDescripcion} numberOfLines={2}>
        {solicitud.descripcion ?? 'Sin descripción'}
      </Text>
      <Text style={styles.cardFecha}>{fecha}</Text>
      {/* Indicador de chat activo cuando la solicitud está aceptada (Task 3) */}
      {solicitud.estado === 'ACEPTADA' && (
        <View style={styles.chatIndicador}>
          <Ionicons name="chatbubbles-outline" size={13} color={COLORS.info} />
          <Text style={styles.chatIndicadorTexto}>Chat activo</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function SolicitudesScreen({ navigation }) {
  const { user } = useUser();
  const [tab, setTab] = useState('enviadas');
  const [enviadas, setEnviadas]   = useState([]);
  const [recibidas, setRecibidas] = useState([]);
  const [cargando, setCargando]   = useState(false);

  const cargar = useCallback(async () => {
    if (!user.userId) return;
    setCargando(true);
    try {
      // Cargamos ambas listas en paralelo; si no es trabajador, recibidas queda vacía
      const [env, rec] = await Promise.all([
        listarPorCliente(user.userId),
        user.esTrabajador ? listarPorTrabajador(user.trabajadorId) : Promise.resolve([]),
      ]);
      setEnviadas(env);
      setRecibidas(rec);
    } catch {
      // silencioso — la lista queda vacía
    } finally {
      setCargando(false);
    }
  }, [user]);

  // useFocusEffect ejecuta cargar() cada vez que esta pantalla gana foco
  // (al navegar hacia atrás desde DetalleSolicitudScreen, por ejemplo)
  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  const lista = tab === 'enviadas' ? enviadas : recibidas;

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      <View style={styles.header}>
        <Text style={styles.headerTitulo}>Solicitudes</Text>
      </View>

      {/* TABS — solo si es trabajador */}
      {user.esTrabajador && (
        <View style={styles.tabsRow}>
          <TouchableOpacity style={[styles.tab, tab === 'enviadas' && styles.tabActivo]}
            onPress={() => setTab('enviadas')}>
            <Text style={[styles.tabTexto, tab === 'enviadas' && styles.tabTextoActivo]}>Enviadas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, tab === 'recibidas' && styles.tabActivo]}
            onPress={() => setTab('recibidas')}>
            <Text style={[styles.tabTexto, tab === 'recibidas' && styles.tabTextoActivo]}>Recibidas</Text>
          </TouchableOpacity>
        </View>
      )}

      {cargando ? (
        <View style={styles.centrado}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : lista.length === 0 ? (
        <View style={styles.centrado}>
          <Ionicons name="document-text-outline" size={48} color={COLORS.disabled} />
          <Text style={styles.vacioPrincipal}>
            {tab === 'enviadas' ? 'Sin solicitudes enviadas' : 'Sin solicitudes recibidas'}
          </Text>
          <Text style={styles.vacioSub}>
            {tab === 'enviadas'
              ? 'Busca un técnico en Inicio y contáctalo.'
              : 'Cuando un cliente te contacte, aparecerá aquí.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={lista}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <SolicitudCard
              solicitud={item}
              modoTrabajador={tab === 'recibidas'}
              onPress={() => navigation.navigate('DetalleSolicitud', {
                solicitud: item,
                modoTrabajador: tab === 'recibidas',
              })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  headerTitulo: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  tabsRow: { flexDirection: 'row', backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActivo: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabTexto: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted },
  tabTextoActivo: { color: COLORS.primary },
  card: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardNombre: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  estadoBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  estadoTexto: { fontSize: 11, fontWeight: '700' },
  cardOficio:      { fontSize: 12, fontWeight: '600', color: COLORS.primary, marginBottom: 4 },
  cardDescripcion: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 8 },
  cardFecha: { fontSize: 11, color: COLORS.textMuted },
  centrado: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  vacioPrincipal: { fontSize: 16, fontWeight: '700', color: COLORS.textLight, marginTop: 12, textAlign: 'center' },
  vacioSub: { fontSize: 13, color: COLORS.textMuted, marginTop: 6, textAlign: 'center', lineHeight: 20 },
  // Estilos para el indicador de chat activo en la tarjeta (Task 3)
  chatIndicador: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  chatIndicadorTexto: { fontSize: 11, color: COLORS.info, fontWeight: '600' },
});
