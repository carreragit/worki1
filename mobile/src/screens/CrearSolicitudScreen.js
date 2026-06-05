import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { crearSolicitud } from '../services/solicitudService';

export default function CrearSolicitudScreen({ route, navigation }) {
  const { worker } = route.params;

  const [descripcion, setDescripcion]   = useState('');
  const [fecha, setFecha]               = useState('');
  const [hora, setHora]                 = useState('');
  const [direccion, setDireccion]       = useState('');
  const [enviando, setEnviando]         = useState(false);

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
        trabajadorId: worker.id,
        oficioId: null,
        descripcion: descripcion.trim(),
        fechaHoraPreferida: parseFechaHora(),
        direccion: direccion.trim() || null,
      });
      Alert.alert(
        '¡Solicitud enviada!',
        `Tu solicitud a ${worker.nombre} fue enviada. Te contactará pronto.`,
        [{ text: 'OK', onPress: () => navigation.navigate('Tabs') }]
      );
    } catch (error) {
      const mensaje =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (error?.response?.status === 500 ? 'Ya existe una solicitud activa para este trabajador.' : 'No se pudo enviar la solicitud. Intenta de nuevo.');
      Alert.alert('Error', mensaje);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btnAtras}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Solicitar servicio</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ── INFO TRABAJADOR ── */}
        <View style={styles.workerCard}>
          <View style={[styles.avatar, { backgroundColor: worker.color }]}>
            <Text style={styles.avatarTexto}>{worker.iniciales}</Text>
          </View>
          <View style={styles.workerInfo}>
            <Text style={styles.workerNombre}>{worker.nombre}</Text>
            <Text style={styles.workerOficio}>
              {worker.oficio} · ★ {worker.rating} · Disponible hoy
            </Text>
          </View>
        </View>

        <View style={styles.formulario}>

          {/* ── TIPO DE SERVICIO ── */}
          <Text style={styles.label}>Tipo de servicio</Text>
          <View style={styles.tipoServicioBox}>
            <Text style={styles.tipoServicioTexto}>{worker.oficio}</Text>
            <Ionicons name="chevron-down" size={18} color="#6B7280" />
          </View>

          {/* ── DESCRIPCIÓN ── */}
          <Text style={styles.label}>Describe tu necesidad</Text>
          <TextInput
            style={styles.textarea}
            placeholder={`Ej: Necesito ayuda con ${worker.oficio.toLowerCase()}, el problema es...`}
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            value={descripcion}
            onChangeText={setDescripcion}
            maxLength={2000}
          />

          {/* ── FECHA Y HORA ── */}
          <Text style={styles.label}>Fecha y hora preferida</Text>
          <View style={styles.fechaHoraRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="#9CA3AF"
              value={fecha}
              onChangeText={setFecha}
              keyboardType="numeric"
              maxLength={10}
            />
            <TextInput
              style={[styles.input, { width: 100 }]}
              placeholder="HH:MM"
              placeholderTextColor="#9CA3AF"
              value={hora}
              onChangeText={setHora}
              keyboardType="numeric"
              maxLength={5}
            />
          </View>

          {/* ── DIRECCIÓN ── */}
          <Text style={styles.label}>Dirección del servicio</Text>
          <TextInput
            style={styles.input}
            placeholder="Calle y número, comuna"
            placeholderTextColor="#9CA3AF"
            value={direccion}
            onChangeText={setDireccion}
          />

          {/* ── PRECIO ESTIMADO ── */}
          <View style={styles.precioBloque}>
            <Text style={styles.precioLabel}>Precio estimado</Text>
            <Text style={styles.precioValor}>${worker.precio}</Text>
            <Text style={styles.precioNota}>El pago se coordina directamente con el técnico</Text>
          </View>

        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── BOTÓN FIJO ── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.btnEnviar, enviando && styles.btnEnviando]}
          activeOpacity={0.85}
          onPress={handleEnviar}
          disabled={enviando}
        >
          {enviando
            ? <ActivityIndicator color="#FFFFFF" />
            : <Text style={styles.btnEnviarTexto}>Enviar solicitud</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#FFFFFF' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  btnAtras: { padding: 4 },
  headerTitulo: { fontSize: 17, fontWeight: '700', color: '#111827' },

  workerCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarTexto: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  workerInfo: { flex: 1 },
  workerNombre: { fontSize: 16, fontWeight: '700', color: '#111827' },
  workerOficio: { fontSize: 13, color: '#6B7280', marginTop: 3 },

  formulario: { padding: 20 },

  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 16 },

  tipoServicioBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#F9FAFB',
  },
  tipoServicioTexto: { fontSize: 14, color: '#111827' },

  textarea: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: '#111827', minHeight: 110,
  },

  input: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: '#111827',
  },

  fechaHoraRow: { flexDirection: 'row', gap: 10 },

  precioBloque: {
    marginTop: 20, padding: 16, backgroundColor: '#F9FAFB',
    borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB',
  },
  precioLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  precioValor: { fontSize: 22, fontWeight: '800', color: '#111827' },
  precioNota: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },

  footer: {
    paddingHorizontal: 20, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: '#E5E7EB', backgroundColor: '#FFFFFF',
  },
  btnEnviar: {
    backgroundColor: '#16A34A', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
  },
  btnEnviando: { opacity: 0.7 },
  btnEnviarTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
