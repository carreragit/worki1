import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { recuperarPassword } from '../services/authService';
import { COLORS, RADII } from '../theme';

export default function RecuperarPasswordScreen({ navigation }) {
  const [email, setEmail]       = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError]       = useState('');
  // enviado=true muestra la pantalla de confirmación en lugar del formulario
  const [enviado, setEnviado]   = useState(false);

  const handleEnviar = async () => {
    if (!email.trim()) { setError('Ingresa tu email.'); return; }
    setCargando(true);
    setError('');
    try {
      await recuperarPassword(email.trim());
    } catch {
      // Silenciamos el error intencionalmente: mostramos siempre el mismo mensaje
      // para no revelar si el email está registrado (evita enumeración de cuentas)
    } finally {
      setCargando(false);
      setEnviado(true);
    }
  };

  return (
    <SafeAreaView style={styles.pantalla}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btnAtras}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Recuperar contraseña</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.contenido}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {!enviado ? (
          // Formulario inicial: pide el email
          <>
            <Text style={styles.descripcion}>
              Ingresa tu email y te enviaremos un código de 6 dígitos para restablecer tu contraseña.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={t => { setEmail(t); setError(''); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TouchableOpacity style={styles.boton} onPress={handleEnviar} disabled={cargando}>
              {cargando
                ? <ActivityIndicator color={COLORS.surface} />
                : <Text style={styles.botonTexto}>Enviar código</Text>
              }
            </TouchableOpacity>
          </>
        ) : (
          // Pantalla de confirmación — igual para éxito y fallo para no enumerar emails
          <>
            <View style={styles.iconoContenedor}>
              <Ionicons name="mail-outline" size={56} color={COLORS.primary} />
            </View>
            <Text style={styles.confirmTitulo}>Revisa tu correo</Text>
            <Text style={styles.confirmDesc}>
              Si ese email está registrado en Worki, recibirás un código de 6 dígitos en los próximos minutos.
            </Text>
            <TouchableOpacity
              style={styles.boton}
              onPress={() => navigation.navigate('ResetPassword')}
            >
              <Text style={styles.botonTexto}>Ingresar código</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkVolver} onPress={() => navigation.goBack()}>
              <Text style={styles.linkVolverTexto}>Volver al inicio de sesión</Text>
            </TouchableOpacity>
          </>
        )}
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
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: RADII.md,
    padding: 14, marginBottom: 16, fontSize: 15,
    backgroundColor: COLORS.surface, color: COLORS.textPrimary,
  },
  error: { color: COLORS.error, marginBottom: 12, fontSize: 13 },
  boton: {
    backgroundColor: COLORS.primary, padding: 16,
    borderRadius: RADII.md, alignItems: 'center', marginTop: 8,
  },
  botonTexto: { color: COLORS.surface, fontSize: 16, fontWeight: '700' },
  iconoContenedor: { alignItems: 'center', marginBottom: 24, marginTop: 8 },
  confirmTitulo: {
    fontSize: 22, fontWeight: '700', color: COLORS.textPrimary,
    textAlign: 'center', marginBottom: 12,
  },
  confirmDesc: {
    fontSize: 14, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 22, marginBottom: 32,
  },
  linkVolver: { alignItems: 'center', marginTop: 16 },
  linkVolverTexto: { color: COLORS.textMuted, fontSize: 14 },
});
