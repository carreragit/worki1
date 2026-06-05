/**
 * DetalleSolicitudScreen
 *
 * Muestra los datos completos de una solicitud y los botones de acción
 * que corresponden según el rol del usuario y el estado actual:
 *
 *   Trabajador + PENDIENTE  → Aceptar / Rechazar
 *   Trabajador + ACEPTADA   → Marcar completada / Cancelar
 *   Cliente    + PENDIENTE o ACEPTADA → Cancelar
 *   Ambos      + ACEPTADA   → Abrir chat
 *   Cliente    + COMPLETADA → Dejar reseña
 *
 * El parámetro `modoTrabajador` viene de la pantalla anterior (SolicitudesScreen)
 * e indica si el usuario está viendo la solicitud como cliente o como trabajador.
 * La solicitud se actualiza localmente tras cada acción sin necesidad de recargar.
 */
import { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { actualizarEstado } from '../services/solicitudService';
import { useUser } from '../context/UserContext';
import { COLORS, ESTADO_COLORS, RATING_COLORS } from '../theme';

function FilaDato({ icono, label, valor }) {
  if (!valor) return null;
  return (
    <View style={styles.fila}>
      <Ionicons name={icono} size={16} color={COLORS.textMuted} style={{ marginRight: 8, marginTop: 1 }} />
      <View style={{ flex: 1 }}>
        <Text style={styles.filaLabel}>{label}</Text>
        <Text style={styles.filaValor}>{valor}</Text>
      </View>
    </View>
  );
}

export default function DetalleSolicitudScreen({ route, navigation }) {
  // solicitudInicial viene desde SolicitudesScreen; se copia al estado local para poder actualizarla
  const { solicitud: solicitudInicial, modoTrabajador } = route.params;
  const { user } = useUser();
  const [solicitud, setSolicitud] = useState(solicitudInicial);
  const [cargando, setCargando]   = useState(false);

  // Confirma la acción con un diálogo antes de llamar al backend
  const ejecutarAccion = async (nuevoEstado) => {
    const mensajes = {
      ACEPTADA:   '¿Aceptar esta solicitud?',
      RECHAZADA:  '¿Rechazar esta solicitud?',
      COMPLETADA: '¿Marcar como completada?',
      CANCELADA:  '¿Cancelar esta solicitud?',
    };
    Alert.alert('Confirmar', mensajes[nuevoEstado], [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí', onPress: async () => {
          setCargando(true);
          try {
            const actualizada = await actualizarEstado(solicitud.id, nuevoEstado);
            setSolicitud(actualizada);
          } catch (e) {
            Alert.alert('Error', e?.response?.data?.message || 'No se pudo actualizar el estado.');
          } finally {
            setCargando(false);
          }
        }
      }
    ]);
  };

  // Colores del badge de estado; si llega un estado desconocido, se usa el estilo de PENDIENTE
  const estado = ESTADO_COLORS[solicitud.estado] ?? ESTADO_COLORS.PENDIENTE;
  // Según el rol, mostramos el nombre de la contraparte (cliente ve al técnico y viceversa)
  const nombreOtro = modoTrabajador ? solicitud.nombreCliente : solicitud.nombreTrabajador;

  const fechaFormateada = solicitud.fechaHoraPreferida
    ? new Date(solicitud.fechaHoraPreferida).toLocaleString('es-CL', {
        day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit'
      })
    : null;

  return (
    <SafeAreaView style={styles.pantalla}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btnAtras}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Detalle de solicitud</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.contenido}>

        {/* ESTADO */}
        <View style={[styles.estadoBloque, { backgroundColor: estado.bg }]}>
          <Text style={[styles.estadoTexto, { color: estado.text }]}>{solicitud.estado}</Text>
          <Text style={[styles.estadoFecha, { color: estado.text + '99' }]}>
            #{solicitud.id} · {new Date(solicitud.createdAt).toLocaleDateString('es-CL')}
          </Text>
        </View>

        {/* DATOS */}
        <View style={styles.seccion}>
          <FilaDato icono="person-outline"        label={modoTrabajador ? 'Cliente' : 'Técnico'} valor={nombreOtro} />
          <FilaDato icono="document-text-outline" label="Descripción"    valor={solicitud.descripcion} />
          <FilaDato icono="calendar-outline"      label="Fecha preferida" valor={fechaFormateada} />
          <FilaDato icono="location-outline"      label="Dirección"      valor={solicitud.direccion} />
        </View>

        {/* ACCIONES */}
        {cargando ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 24 }} />
        ) : (
          <View style={styles.acciones}>
            {modoTrabajador && solicitud.estado === 'PENDIENTE' && (
              <>
                <TouchableOpacity style={styles.btnAceptar} onPress={() => ejecutarAccion('ACEPTADA')}>
                  <Text style={styles.btnTexto}>Aceptar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnRechazar} onPress={() => ejecutarAccion('RECHAZADA')}>
                  <Text style={[styles.btnTexto, { color: COLORS.error }]}>Rechazar</Text>
                </TouchableOpacity>
              </>
            )}
            {modoTrabajador && solicitud.estado === 'ACEPTADA' && (
              <>
                <TouchableOpacity style={styles.btnAceptar} onPress={() => ejecutarAccion('COMPLETADA')}>
                  <Text style={styles.btnTexto}>Marcar completada</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnCancelar} onPress={() => ejecutarAccion('CANCELADA')}>
                  <Text style={[styles.btnTexto, { color: COLORS.textSecondary }]}>Cancelar</Text>
                </TouchableOpacity>
              </>
            )}
            {!modoTrabajador && (solicitud.estado === 'PENDIENTE' || solicitud.estado === 'ACEPTADA') && (
              <TouchableOpacity style={styles.btnCancelar} onPress={() => ejecutarAccion('CANCELADA')}>
                <Text style={[styles.btnTexto, { color: COLORS.textSecondary }]}>Cancelar solicitud</Text>
              </TouchableOpacity>
            )}
            {/* Botón chat: disponible para ambos cuando la solicitud está ACEPTADA (Task 2) */}
            {solicitud.estado === 'ACEPTADA' && (
              <TouchableOpacity
                style={styles.btnChat}
                onPress={() => navigation.navigate('Chat', { solicitud })}
              >
                <Ionicons name="chatbubbles-outline" size={18} color={COLORS.info} style={{ marginRight: 8 }} />
                <Text style={styles.btnChatTexto}>Abrir chat</Text>
              </TouchableOpacity>
            )}
            {/* Botón calificar: solo para el cliente cuando la solicitud está COMPLETADA */}
            {!modoTrabajador && solicitud.estado === 'COMPLETADA' && (
              <TouchableOpacity
                style={styles.btnCalificar}
                onPress={() => navigation.navigate('Calificar', { solicitud })}
              >
                <Ionicons name="star-outline" size={18} color={RATING_COLORS.star} style={{ marginRight: 8 }} />
                <Text style={styles.btnCalificarTexto}>Dejar reseña</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  btnAtras: { padding: 4 },
  headerTitulo: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary },
  contenido: { padding: 20 },
  estadoBloque: { borderRadius: 14, padding: 16, marginBottom: 20, alignItems: 'center' },
  estadoTexto: { fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  estadoFecha: { fontSize: 12, marginTop: 4 },
  seccion: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 20 },
  fila: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  filaLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600', marginBottom: 2 },
  filaValor: { fontSize: 14, color: COLORS.textPrimary },
  acciones: { gap: 10 },
  btnAceptar: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  btnRechazar: { backgroundColor: COLORS.errorBg, borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.errorBorder },
  btnCancelar: { backgroundColor: COLORS.surfaceAlt, borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  btnTexto: { fontSize: 15, fontWeight: '700', color: COLORS.surface },
  btnCalificar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: RATING_COLORS.bg, borderRadius: 14, paddingVertical: 14,
    borderWidth: 1, borderColor: RATING_COLORS.border,
  },
  btnCalificarTexto: { fontSize: 15, fontWeight: '700', color: RATING_COLORS.text },
  // Estilos para el botón de chat (Task 2)
  btnChat: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.infoBg, borderRadius: 14, paddingVertical: 14,
    borderWidth: 1, borderColor: COLORS.infoBorder,
  },
  btnChatTexto: { fontSize: 15, fontWeight: '700', color: COLORS.info },
});
