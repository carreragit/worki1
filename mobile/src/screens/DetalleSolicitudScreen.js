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
  StyleSheet, Alert, ActivityIndicator, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { actualizarEstado, generarCodigo, verificarCodigo } from '../services/solicitudService';
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
  const [solicitud, setSolicitud] = useState(solicitudInicial);
  const [cargando, setCargando]   = useState(false);
  const [inputCodigo, setInputCodigo]       = useState('');
  const [cargandoCodigo, setCargandoCodigo] = useState(false);
  const [errCodigo, setErrCodigo]           = useState('');

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

  const handleGenerarCodigo = async () => {
    setCargandoCodigo(true);
    try {
      const actualizada = await generarCodigo(solicitud.id);
      setSolicitud(actualizada);
    } catch (e) {
      Alert.alert('Error', 'No se pudo generar el código.');
    } finally {
      setCargandoCodigo(false);
    }
  };

  const handleVerificarCodigo = async () => {
    if (!inputCodigo.trim()) { setErrCodigo('Ingresa el código'); return; }
    setCargandoCodigo(true);
    setErrCodigo('');
    try {
      const actualizada = await verificarCodigo(solicitud.id, inputCodigo.trim());
      setSolicitud(actualizada);
      setInputCodigo('');
    } catch (e) {
      setErrCodigo('Código incorrecto. Intenta de nuevo.');
    } finally {
      setCargandoCodigo(false);
    }
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
          <FilaDato icono="briefcase-outline"     label="Servicio"       valor={solicitud.nombreOficio} />
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
                {!solicitud.codigoVerificacion ? (
                  <TouchableOpacity style={styles.btnAceptar} onPress={handleGenerarCodigo} disabled={cargandoCodigo}>
                    {cargandoCodigo
                      ? <ActivityIndicator color={COLORS.surface} />
                      : <Text style={styles.btnTexto}>Generar código de llegada</Text>
                    }
                  </TouchableOpacity>
                ) : (
                  <View style={styles.codigoIngresoBloque}>
                    <Text style={styles.codigoIngresoLabel}>Pídele al cliente que abra la app — te dirá el código</Text>
                    <TextInput
                      style={styles.codigoInput}
                      value={inputCodigo}
                      onChangeText={t => { setInputCodigo(t); setErrCodigo(''); }}
                      keyboardType="numeric"
                      maxLength={4}
                      placeholder="0000"
                      placeholderTextColor={COLORS.textMuted}
                    />
                    {errCodigo ? <Text style={styles.codigoError}>{errCodigo}</Text> : null}
                    <TouchableOpacity style={styles.btnAceptar} onPress={handleVerificarCodigo} disabled={cargandoCodigo}>
                      {cargandoCodigo
                        ? <ActivityIndicator color={COLORS.surface} />
                        : <Text style={styles.btnTexto}>Confirmar llegada</Text>
                      }
                    </TouchableOpacity>
                  </View>
                )}
                <TouchableOpacity style={styles.btnCancelar} onPress={() => ejecutarAccion('CANCELADA')}>
                  <Text style={[styles.btnTexto, { color: COLORS.textSecondary }]}>Cancelar</Text>
                </TouchableOpacity>
              </>
            )}
            {modoTrabajador && solicitud.estado === 'EN_PROCESO' && (
              <>
                <TouchableOpacity style={styles.btnAceptar} onPress={() => ejecutarAccion('COMPLETADA')}>
                  <Text style={styles.btnTexto}>Marcar completada</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnCancelar} onPress={() => ejecutarAccion('CANCELADA')}>
                  <Text style={[styles.btnTexto, { color: COLORS.textSecondary }]}>Cancelar</Text>
                </TouchableOpacity>
              </>
            )}
            {!modoTrabajador && solicitud.estado === 'ACEPTADA' && solicitud.codigoVerificacion && (
              <View style={styles.codigoBloque}>
                <Text style={styles.codigoLabel}>Dile este código al técnico cuando llegue</Text>
                <Text style={styles.codigoCodigo}>{solicitud.codigoVerificacion}</Text>
              </View>
            )}
            {!modoTrabajador && (solicitud.estado === 'PENDIENTE' || solicitud.estado === 'ACEPTADA' || solicitud.estado === 'EN_PROCESO') && (
              <TouchableOpacity style={styles.btnCancelar} onPress={() => ejecutarAccion('CANCELADA')}>
                <Text style={[styles.btnTexto, { color: COLORS.textSecondary }]}>Cancelar solicitud</Text>
              </TouchableOpacity>
            )}
            {/* Botón chat: disponible para ambos cuando la solicitud está ACEPTADA o EN_PROCESO */}
            {(solicitud.estado === 'ACEPTADA' || solicitud.estado === 'EN_PROCESO') && (
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
  codigoBloque: { backgroundColor: '#F5F3FF', borderRadius: 14, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#DDD6FE' },
  codigoLabel: { fontSize: 13, color: '#5B21B6', fontWeight: '600', marginBottom: 12, textAlign: 'center' },
  codigoCodigo: { fontSize: 52, fontWeight: '900', color: '#4C1D95', letterSpacing: 10 },
  codigoIngresoBloque: { backgroundColor: COLORS.surfaceAlt, borderRadius: 14, padding: 16, gap: 10 },
  codigoIngresoLabel: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' },
  codigoInput: { backgroundColor: COLORS.surface, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, fontSize: 28, fontWeight: '700', textAlign: 'center', paddingVertical: 12, color: COLORS.textPrimary, letterSpacing: 8 },
  codigoError: { fontSize: 12, color: COLORS.error, textAlign: 'center' },
  btnChat: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.infoBg, borderRadius: 14, paddingVertical: 14,
    borderWidth: 1, borderColor: COLORS.infoBorder,
  },
  btnChatTexto: { fontSize: 15, fontWeight: '700', color: COLORS.info },
});
