/**
 * ActivarTrabajadorScreen
 *
 * Formulario para que un cliente se registre como trabajador en Worki.
 * Al enviar:
 *   1. Pide permiso de ubicación GPS (obligatorio — se guarda para búsqueda por radio).
 *   2. Llama a activarTrabajador() → crea el registro de Trabajador en user-service.
 *   3. Llama a crearOficio() → crea el primer servicio asociado al trabajador.
 *   4. Actualiza el contexto de usuario (esTrabajador = true) para que el resto
 *      de la app sepa inmediatamente que el usuario ahora es trabajador.
 */
import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { activarTrabajador, crearOficio } from '../services/userService';
import { useUser } from '../context/UserContext';
import { COLORS } from '../theme';

export default function ActivarTrabajadorScreen({ navigation }) {
  // setUser se usa al final para marcar al usuario como trabajador sin necesidad de hacer logout/login
  const { user, setUser } = useUser();

  const [especialidad, setEspecialidad]     = useState('');
  const [nombreServicio, setNombreServicio] = useState('');
  const [descripcion, setDescripcion]       = useState('');
  const [tarifaHora, setTarifaHora]         = useState('');
  const [tarifaBase, setTarifaBase]         = useState('');
  const [radioKm, setRadioKm]               = useState('5');
  const [enviando, setEnviando]             = useState(false);

  const handleActivar = async () => {
    if (!especialidad.trim() || !nombreServicio.trim()) {
      Alert.alert('Campos requeridos', 'Especialidad y nombre del servicio son obligatorios.');
      return;
    }

    setEnviando(true);
    try {
      // Primero pedimos el GPS — es necesario para que el backend guarde la ubicación del trabajador
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Ubicación requerida', 'Necesitamos tu ubicación para mostrarle a los clientes dónde operas.');
        setEnviando(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });

      // Paso 1: crear el registro de Trabajador con la ubicación GPS actual
      const trabajador = await activarTrabajador({
        perfilId: user.perfilId,
        latitud: loc.coords.latitude,
        longitud: loc.coords.longitude,
        radioKm: Number(radioKm) || 5,
      });

      // Paso 2: crear el primer Oficio vinculado al trabajador recién creado
      await crearOficio({
        trabajadorId: trabajador.id,
        especialidad: especialidad.trim(),
        nombreServicio: nombreServicio.trim(),
        descripcionServicio: descripcion.trim() || null,
        tarifaHora: tarifaHora ? Number(tarifaHora) : null,
        tarifaServicioBase: tarifaBase ? Number(tarifaBase) : null,
      });

      // Paso 3: actualizar el contexto global para que toda la app sepa que ahora es trabajador
      setUser(prev => ({ ...prev, esTrabajador: true, trabajadorId: trabajador.id }));

      Alert.alert(
        '¡Perfil activado!',
        'Ya apareces como trabajador en Worki. Los clientes podrán encontrarte.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      const mensaje = error?.response?.data?.message || 'Error al activar el perfil. Intenta de nuevo.';
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
        <Text style={styles.headerTitulo}>Activar perfil trabajador</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.formulario} keyboardShouldPersistTaps="handled">
        <Text style={styles.intro}>
          Completa tu primer servicio. Después podrás agregar más desde tu perfil.
        </Text>

        <Text style={styles.label}>Especialidad *</Text>
        <TextInput style={styles.input} placeholder="Ej: Electricista, Gasfiter, Pintor..."
          placeholderTextColor={COLORS.textMuted} value={especialidad} onChangeText={setEspecialidad} />

        <Text style={styles.label}>Nombre del servicio *</Text>
        <TextInput style={styles.input} placeholder="Ej: Instalaciones eléctricas residenciales"
          placeholderTextColor={COLORS.textMuted} value={nombreServicio} onChangeText={setNombreServicio} />

        <Text style={styles.label}>Descripción (opcional)</Text>
        <TextInput style={[styles.input, { height: 80 }]}
          placeholder="Describe brevemente qué ofreces..."
          placeholderTextColor={COLORS.textMuted} multiline textAlignVertical="top"
          value={descripcion} onChangeText={setDescripcion} />

        <View style={styles.dosCampos}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Tarifa por hora ($)</Text>
            <TextInput style={styles.input} placeholder="0" placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric" value={tarifaHora} onChangeText={setTarifaHora} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Tarifa base ($)</Text>
            <TextInput style={styles.input} placeholder="0" placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric" value={tarifaBase} onChangeText={setTarifaBase} />
          </View>
        </View>

        <Text style={styles.label}>Radio de cobertura (km)</Text>
        <TextInput style={styles.input} placeholder="5" placeholderTextColor={COLORS.textMuted}
          keyboardType="numeric" value={radioKm} onChangeText={setRadioKm} />

        <Text style={styles.nota}>Se usará tu ubicación actual para determinar dónde operas.</Text>

        <TouchableOpacity style={[styles.btnActivar, enviando && { opacity: 0.7 }]}
          onPress={handleActivar} disabled={enviando}>
          {enviando ? <ActivityIndicator color={COLORS.surface} /> : <Text style={styles.btnActivarTexto}>Activar mi perfil</Text>}
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORS.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  btnAtras: { padding: 4 },
  headerTitulo: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary },
  formulario: { padding: 20 },
  intro: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 8 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textLight, marginBottom: 6, marginTop: 14 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: COLORS.textPrimary },
  dosCampos: { flexDirection: 'row', gap: 12 },
  nota: { fontSize: 12, color: COLORS.textMuted, marginTop: 8, fontStyle: 'italic' },
  btnActivar: { marginTop: 24, backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  btnActivarTexto: { color: COLORS.surface, fontSize: 16, fontWeight: '700' },
});
