import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { registro } from '../services/authService';
import { COLORS, GRADIENTS, RADII, SHADOWS } from '../theme';

export default function RegisterScreen({ navigation }) {
  const [nombre, setNombre]                   = useState('');
  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [codigoReferido, setCodigoReferido]   = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [error, setError]                     = useState('');
  const [loading, setLoading]                 = useState(false);

  const validarPassword = (pwd) => {
    if (pwd.length < 8) return 'La contrasena debe tener al menos 8 caracteres';
    if (!/[A-Z]/.test(pwd)) return 'La contrasena debe tener al menos una mayuscula';
    if (!/[a-z]/.test(pwd)) return 'La contrasena debe tener al menos una minuscula';
    if (!/\d/.test(pwd)) return 'La contrasena debe tener al menos un numero';
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) return 'La contrasena debe tener al menos un caracter especial (!@#$%...)';
    return null;
  };

  const handleRegistro = async () => {
    setError('');

    if (!nombre.trim()) { setError('El nombre es obligatorio'); return; }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('El email no tiene formato valido');
      return;
    }

    const errorPassword = validarPassword(password);
    if (errorPassword) { setError(errorPassword); return; }

    if (password !== confirmarPassword) { setError('Las contrasenas no coinciden'); return; }

    setLoading(true);
    try {
      await registro(nombre, email, password, codigoReferido || null);
      navigation.navigate('Login', { mensajeExito: 'Cuenta creada. Revisa tu email para verificarla.' });
    } catch (e) {
      setError(e.response?.data?.error || 'Error al registrarse. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.pantalla}>
      <LinearGradient
        colors={GRADIENTS.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitulo}>Worki</Text>
        <Text style={styles.headerSubtitulo}>Crea tu cuenta gratis</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.formulario} keyboardShouldPersistTaps="handled">
          <Text style={styles.titulo}>Crear cuenta</Text>
          <Text style={styles.subtitulo}>Completa tus datos para registrarte</Text>

          <TextInput
            style={styles.input}
            placeholder="Nombre completo"
            placeholderTextColor={COLORS.textMuted}
            value={nombre}
            onChangeText={setNombre}
            autoCapitalize="words"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={COLORS.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputTexto}
              placeholder="Contrasena"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!mostrarPassword}
            />
            <TouchableOpacity onPress={() => setMostrarPassword(!mostrarPassword)} style={styles.ojito}>
              <Ionicons name={mostrarPassword ? 'eye-off' : 'eye'} size={22} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>
            Minimo 8 caracteres, una mayuscula, una minuscula, un numero y un caracter especial
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputTexto}
              placeholder="Confirmar contrasena"
              placeholderTextColor={COLORS.textMuted}
              value={confirmarPassword}
              onChangeText={setConfirmarPassword}
              secureTextEntry={!mostrarConfirmar}
            />
            <TouchableOpacity onPress={() => setMostrarConfirmar(!mostrarConfirmar)} style={styles.ojito}>
              <Ionicons name={mostrarConfirmar ? 'eye-off' : 'eye'} size={22} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Codigo de referido (opcional)"
            placeholderTextColor={COLORS.textMuted}
            value={codigoReferido}
            onChangeText={setCodigoReferido}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.boton} onPress={handleRegistro} disabled={loading}>
            {loading
              ? <ActivityIndicator color={COLORS.surface} />
              : <Text style={styles.botonTexto}>Crear cuenta</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Ya tienes cuenta? <Text style={styles.linkNegrita}>Inicia sesion</Text></Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORS.background },

  header: {
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius:  RADII.full,
    borderBottomRightRadius: RADII.full,
    alignItems: 'center',
  },
  headerTitulo:    { color: COLORS.surface, fontSize: 38, fontWeight: '800' },
  headerSubtitulo: { color: COLORS.primaryLight, fontSize: 14, marginTop: 6 },

  formulario: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40 },

  titulo:    { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  subtitulo: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 24 },

  input: {
    borderWidth:     1,
    borderColor:     COLORS.border,
    borderRadius:    RADII.md,
    padding:         14,
    marginBottom:    16,
    fontSize:        15,
    backgroundColor: COLORS.surface,
    color:           COLORS.textPrimary,
  },
  inputContainer: {
    flexDirection:   'row',
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     COLORS.border,
    borderRadius:    RADII.md,
    marginBottom:    8,
    backgroundColor: COLORS.surface,
  },
  inputTexto: { flex: 1, padding: 14, fontSize: 15, color: COLORS.textPrimary },
  ojito:      { padding: 14 },

  hint:  { fontSize: 12, color: COLORS.textMuted, marginBottom: 16, marginTop: 2 },
  error: { color: COLORS.error, marginBottom: 12, textAlign: 'center', fontSize: 13 },

  boton: {
    backgroundColor: COLORS.primary,
    padding:         16,
    borderRadius:    RADII.md,
    alignItems:      'center',
    marginBottom:    20,
    marginTop:       8,
    ...SHADOWS.boton,
  },
  botonTexto: { color: COLORS.surface, fontSize: 16, fontWeight: '700' },

  link:        { textAlign: 'center', color: COLORS.textSecondary, fontSize: 14 },
  linkNegrita: { color: COLORS.primary, fontWeight: '700' },
});
