import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { resetPassword } from '../services/authService';
import { COLORS, RADII } from '../theme';

export default function ResetPasswordScreen({ navigation }) {
  const [codigo, setCodigo]               = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando]           = useState(false);
  const [error, setError]                 = useState('');
  // exito=true reemplaza la pantalla entera para que el usuario no pueda volver atrás
  const [exito, setExito]                 = useState(false);

  const handleCambiar = async () => {
    if (codigo.length !== 6) { setError('El código debe tener 6 dígitos.'); return; }
    if (!nuevaPassword.trim()) { setError('Ingresa la nueva contraseña.'); return; }
    setCargando(true);
    setError('');
    try {
      await resetPassword(codigo, nuevaPassword.trim());
      setExito(true);
    } catch (e) {
      // El backend devuelve mensajes descriptivos (token inválido, expirado, ya usado)
      const mensaje = e?.response?.data?.message || 'Código incorrecto o expirado. Solicita uno nuevo.';
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  };

  // Vista de éxito: pantalla separada para que el usuario no pueda reenviar el formulario
  if (exito) {
    return (
      <SafeAreaView style={styles.pantalla}>
        <View style={styles.header}>
          <View style={{ width: 40 }} />
          <Text style={styles.headerTitulo}>Nueva contraseña</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.exitoContenedor}>
          <Ionicons name="checkmark-circle-outline" size={72} color={COLORS.success} />
          <Text style={styles.exitoTitulo}>¡Contraseña actualizada!</Text>
          <Text style={styles.exitoDesc}>
            Ya puedes iniciar sesión con tu nueva contraseña.
          </Text>
          <TouchableOpacity style={styles.boton} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.botonTexto}>Ir al inicio de sesión</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btnAtras}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Nueva contraseña</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.contenido}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Text style={styles.descripcion}>
          Ingresa el código de 6 dígitos que recibiste por email y tu nueva contraseña.
        </Text>

        <Text style={styles.label}>Código</Text>
        {/* Solo acepta dígitos — filtramos caracteres no numéricos en onChangeText */}
        <TextInput
          style={[styles.input, styles.inputCodigo]}
          placeholder="000000"
          placeholderTextColor={COLORS.textMuted}
          value={codigo}
          onChangeText={t => { setCodigo(t.replace(/\D/g, '').slice(0, 6)); setError(''); }}
          keyboardType="numeric"
          maxLength={6}
        />

        <Text style={styles.label}>Nueva contraseña</Text>
        <Text style={styles.requisito}>Mín. 8 caracteres, mayúscula, número y símbolo</Text>
        {/* Campo con ojito para mostrar/ocultar, igual que LoginScreen */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputTexto}
            placeholder="Contraseña"
            placeholderTextColor={COLORS.textMuted}
            value={nuevaPassword}
            onChangeText={t => { setNuevaPassword(t); setError(''); }}
            secureTextEntry={!mostrarPassword}
          />
          <TouchableOpacity
            onPress={() => setMostrarPassword(!mostrarPassword)}
            style={styles.ojito}
          >
            <Ionicons
              name={mostrarPassword ? 'eye-off' : 'eye'}
              size={22}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.boton} onPress={handleCambiar} disabled={cargando}>
          {cargando
            ? <ActivityIndicator color={COLORS.surface} />
            : <Text style={styles.botonTexto}>Cambiar contraseña</Text>
          }
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
    backgroundColor: COLORS.surface,
  },
  btnAtras: { padding: 4 },
  headerTitulo: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary },
  contenido: { flex: 1, paddingHorizontal: 24, paddingTop: 32 },
  descripcion: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 28, lineHeight: 22 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textLight, marginBottom: 6, marginTop: 4 },
  requisito: { fontSize: 12, color: COLORS.textMuted, marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: RADII.md,
    padding: 14, marginBottom: 16, fontSize: 15,
    backgroundColor: COLORS.surface, color: COLORS.textPrimary,
  },
  // El código va centrado con letra grande y espaciado para facilitar la lectura
  inputCodigo: {
    textAlign: 'center', fontSize: 28, fontWeight: '700',
    letterSpacing: 8, paddingVertical: 16,
  },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADII.md, marginBottom: 16,
    backgroundColor: COLORS.surface,
  },
  inputTexto: { flex: 1, padding: 14, fontSize: 15, color: COLORS.textPrimary },
  ojito: { padding: 14 },
  error: { color: COLORS.error, marginBottom: 12, fontSize: 13 },
  boton: {
    backgroundColor: COLORS.primary, padding: 16,
    borderRadius: RADII.md, alignItems: 'center', marginTop: 8,
  },
  botonTexto: { color: COLORS.surface, fontSize: 16, fontWeight: '700' },
  exitoContenedor: {
    flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32,
  },
  exitoTitulo: {
    fontSize: 24, fontWeight: '700', color: COLORS.textPrimary,
    textAlign: 'center', marginTop: 20, marginBottom: 12,
  },
  exitoDesc: {
    fontSize: 14, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 22, marginBottom: 40,
  },
});
