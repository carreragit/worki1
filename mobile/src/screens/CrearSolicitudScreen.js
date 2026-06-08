/**
 * CrearSolicitudScreen
 *
 * Formulario para que un cliente envíe una solicitud de servicio a un técnico.
 *
 * Recibe por parámetro:
 *   - oficio: el oficio seleccionado por defecto (puede ser cualquiera de los del técnico).
 *   - oficios: lista completa de oficios del técnico, para que el cliente pueda
 *              elegir cuál servicio específico necesita.
 *
 * Si el técnico tiene más de un oficio, se muestran botones de selección.
 * Si solo tiene uno, se muestra fijo sin opción a cambiar.
 *
 * Al enviar, se incluye el oficioId del oficio seleccionado — es importante
 * para que el backend asocie la solicitud al servicio correcto y calcule
 * el precio estimado.
 */
// mobile/src/screens/CrearSolicitudScreen.js
import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { crearSolicitud } from '../services/solicitudService';
import { COLORS } from '../theme';

export default function CrearSolicitudScreen({ route, navigation }) {
  const { oficio: oficioInicial, oficios = [] } = route.params;

  const [oficioSeleccionado, setOficioSeleccionado] = useState(oficioInicial);
  const [descripcion, setDescripcion]   = useState('');
  const [fecha, setFecha]               = useState('');
  const [hora, setHora]                 = useState('');
  const [direccion, setDireccion]       = useState('');
  const [enviando, setEnviando]         = useState(false);

  // Convierte la fecha (DD/MM/AAAA) y hora (HH:MM) ingresadas por el usuario
  // al formato ISO 8601 que espera el backend: AAAA-MM-DDTHH:MM:00
  const parseFechaHora = () => {
    if (!fecha || !hora) return null;
    const [dia, mes, anio] = fecha.split('/');
    if (!dia || !mes || !anio) return null;
    return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}T${hora}:00`;
  };

  const handleEnviar = async () => {
    if (!descripcion.trim()) {
      Alert.alert('Campo requerido', 'Por favor describe tu necesidad.');
      return;
    }
    setEnviando(true);
    try {
      await crearSolicitud({
        trabajadorId: oficioSeleccionado.trabajadorId,
        oficioId: oficioSeleccionado.id,
        descripcion: descripcion.trim(),
        fechaHoraPreferida: parseFechaHora(),
        direccion: direccion.trim() || null,
      });
      Alert.alert(
        '¡Solicitud enviada!',
        `Tu solicitud a ${oficioSeleccionado.nombreTrabajador} fue enviada. Te contactará pronto.`,
        [{ text: 'OK', onPress: () => navigation.navigate('Tabs') }]
      );
    } catch (error) {
      const mensaje =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'No se pudo enviar la solicitud. Intenta de nuevo.';
      Alert.alert('Error', mensaje);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btnAtras}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Solicitar servicio</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.formulario}>

          {/* SELECTOR DE OFICIO: si el técnico tiene varios servicios, el cliente elige uno */}
          <Text style={styles.label}>Servicio solicitado</Text>
          {oficios.length > 1 ? (
            oficios.map(o => (
              <TouchableOpacity key={o.id}
                style={[styles.oficioOpcion, oficioSeleccionado.id === o.id && styles.oficioOpcionActivo]}
                onPress={() => setOficioSeleccionado(o)}>
                <Text style={[styles.oficioTexto, oficioSeleccionado.id === o.id && styles.oficioTextoActivo]}>
                  {o.nombreServicio ?? o.especialidad}
                </Text>
                {o.tarifaServicioBase && (
                  <Text style={[styles.oficioTarifa, oficioSeleccionado.id === o.id && { color: '#FFFFFF99' }]}>
                    Desde ${o.tarifaServicioBase.toLocaleString()}
                  </Text>
                )}
                {oficioSeleccionado.id === o.id && (
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.surface} style={{ position: 'absolute', right: 12 }} />
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.oficioFijo}>
              <Text style={styles.oficioTexto}>{oficioSeleccionado.nombreServicio ?? oficioSeleccionado.especialidad}</Text>
            </View>
          )}

          {/* DESCRIPCIÓN */}
          <Text style={styles.label}>Describe tu necesidad</Text>
          <TextInput style={styles.textarea}
            placeholder={`Ej: Necesito ayuda con ${oficioSeleccionado.especialidad?.toLowerCase()}, el problema es...`}
            placeholderTextColor={COLORS.textMuted} multiline numberOfLines={5}
            textAlignVertical="top" value={descripcion} onChangeText={setDescripcion} maxLength={2000} />

          {/* FECHA Y HORA */}
          <Text style={styles.label}>Fecha y hora preferida</Text>
          <View style={styles.fechaHoraRow}>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="DD/MM/AAAA"
              placeholderTextColor={COLORS.textMuted} value={fecha} onChangeText={setFecha}
              keyboardType="numeric" maxLength={10} />
            <TextInput style={[styles.input, { width: 100 }]} placeholder="HH:MM"
              placeholderTextColor={COLORS.textMuted} value={hora} onChangeText={setHora}
              keyboardType="numeric" maxLength={5} />
          </View>

          {/* DIRECCIÓN */}
          <Text style={styles.label}>Dirección del servicio</Text>
          <TextInput style={styles.input} placeholder="Calle y número, comuna"
            placeholderTextColor={COLORS.textMuted} value={direccion} onChangeText={setDireccion} />

          <View style={styles.precioBloque}>
            <Text style={styles.precioLabel}>Precio estimado</Text>
            <Text style={styles.precioValor}>${oficioSeleccionado.tarifaServicioBase?.toLocaleString() ?? '—'}</Text>
            <Text style={styles.precioNota}>El pago se coordina directamente con el técnico</Text>
          </View>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.btnEnviar, enviando && { opacity: 0.7 }]}
          activeOpacity={0.85} onPress={handleEnviar} disabled={enviando}>
          {enviando ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnEnviarTexto}>Enviar solicitud</Text>}
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
  formulario: { padding: 20 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textLight, marginBottom: 8, marginTop: 16 },
  oficioOpcion: { padding: 14, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 8, backgroundColor: COLORS.background },
  oficioOpcionActivo: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  oficioFijo: { padding: 14, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.background },
  oficioTexto: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  oficioTextoActivo: { color: COLORS.surface },
  oficioTarifa: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  textarea: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: COLORS.textPrimary, minHeight: 110 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: COLORS.textPrimary },
  fechaHoraRow: { flexDirection: 'row', gap: 10 },
  precioBloque: { marginTop: 20, padding: 16, backgroundColor: COLORS.background, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  precioLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  precioValor: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
  precioNota: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
  footer: { paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.surface },
  btnEnviar: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  btnEnviarTexto: { color: COLORS.surface, fontSize: 16, fontWeight: '700' },
});
