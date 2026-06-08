/**
 * CalificarScreen
 *
 * Permite al cliente dejar una reseña (1-5 estrellas + comentario opcional)
 * sobre el servicio recibido, una vez que la solicitud está en estado COMPLETADA.
 *
 * Solo el cliente puede calificar — el botón que navega a esta pantalla
 * solo aparece en DetalleSolicitudScreen cuando !modoTrabajador && estado === 'COMPLETADA'.
 *
 * Al enviar, llama a crearCalificacion() con el id de la solicitud y del oficio
 * para que el backend pueda actualizar el promedioCalificacion del oficio.
 */
import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { crearCalificacion } from '../services/calificacionService';
import { useUser } from '../context/UserContext';
import { COLORS, RATING_COLORS } from '../theme';

export default function CalificarScreen({ route, navigation }) {
  // La solicitud viene como parámetro de navegación desde DetalleSolicitudScreen
  const { solicitud } = route.params;
  const { user } = useUser();

  const [puntaje, setPuntaje]       = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando]     = useState(false);

  const handleEnviar = async () => {
    if (puntaje === 0) {
      Alert.alert('Puntaje requerido', 'Selecciona al menos una estrella.');
      return;
    }
    setEnviando(true);
    try {
      // Enviamos el oficioId junto con la solicitud para que el backend
      // actualice el promedio de calificación del oficio específico
      await crearCalificacion({
        solicitudId:  solicitud.id,
        oficioId:     solicitud.oficioId,
        evaluadorId:  user.userId,
        evaluadoId:   solicitud.trabajadorId,
        puntaje,
        comentario:   comentario.trim() || null,
      });
      Alert.alert(
        '¡Reseña enviada!',
        'Gracias por calificar el servicio.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      const mensaje = error?.response?.data?.error || error?.response?.data?.mensaje || 'No se pudo enviar la reseña.';
      Alert.alert('Error', mensaje);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={styles.pantalla}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btnAtras}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Calificar servicio</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">

        <Text style={styles.subtitulo}>
          ¿Cómo fue tu experiencia con{' '}
          <Text style={styles.nombre}>{solicitud.nombreTrabajador ?? 'el técnico'}</Text>?
        </Text>

        {/* SELECTOR DE ESTRELLAS: al tocar una estrella se fija el puntaje (1-5) */}
        <View style={styles.estrellasRow}>
          {[1, 2, 3, 4, 5].map(n => (
            <TouchableOpacity key={n} onPress={() => setPuntaje(n)} style={styles.estrellaTouchable}>
              <Ionicons
                name={n <= puntaje ? 'star' : 'star-outline'}
                size={44}
                color={n <= puntaje ? RATING_COLORS.star : COLORS.disabled}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Texto descriptivo según el puntaje elegido — el índice 0 queda vacío a propósito */}
        {puntaje > 0 && (
          <Text style={styles.puntajeTexto}>
            {['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'][puntaje]}
          </Text>
        )}

        {/* COMENTARIO */}
        <Text style={styles.label}>Comentario (opcional)</Text>
        <TextInput
          style={styles.textarea}
          placeholder="Cuéntanos más sobre tu experiencia..."
          placeholderTextColor={COLORS.textMuted}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={comentario}
          onChangeText={setComentario}
          maxLength={1000}
        />

        <TouchableOpacity
          style={[styles.btnEnviar, (enviando || puntaje === 0) && styles.btnDeshabilitado]}
          onPress={handleEnviar}
          disabled={enviando || puntaje === 0}
        >
          {enviando
            ? <ActivityIndicator color={COLORS.surface} />
            : <Text style={styles.btnEnviarTexto}>Enviar reseña</Text>
          }
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORS.surface },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
  },
  btnAtras: { padding: 4 },
  headerTitulo: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary },
  contenido: { padding: 24, alignItems: 'center' },
  subtitulo: { fontSize: 16, color: COLORS.textLight, textAlign: 'center', marginBottom: 32, lineHeight: 24 },
  nombre: { fontWeight: '700', color: COLORS.textPrimary },
  estrellasRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  estrellaTouchable: { padding: 4 },
  puntajeTexto: { fontSize: 15, fontWeight: '700', color: RATING_COLORS.star, marginBottom: 28 },
  label: { alignSelf: 'flex-start', fontSize: 13, fontWeight: '600', color: COLORS.textLight, marginBottom: 8 },
  textarea: {
    width: '100%', borderWidth: 1, borderColor: COLORS.border, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: COLORS.textPrimary,
    minHeight: 100, marginBottom: 28,
  },
  btnEnviar: {
    width: '100%', backgroundColor: COLORS.primary, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
  },
  btnDeshabilitado: { opacity: 0.5 },
  btnEnviarTexto: { color: COLORS.surface, fontSize: 16, fontWeight: '700' },
});
