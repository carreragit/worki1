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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { login } from '../services/authService';
import { useUser } from '../context/UserContext';
import { COLORS, GRADIENTS, RADII, SHADOWS } from '../theme';

export default function LoginScreen({ navigation, route }) {
  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError]                     = useState('');
  const [loading, setLoading]                 = useState(false);

  const { initUser } = useUser();
  const mensajeExito = route.params?.mensajeExito;

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      await initUser();
      navigation.replace('Tabs');
    } catch (e) {
      if (e.response?.status === 403) {
        setError('Debes verificar tu email antes de iniciar sesion. Revisa tu bandeja de entrada.');
      } else {
        setError(e.response?.data?.error || 'Error al iniciar sesion. Verifica tus credenciales.');
      }
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
        <Text style={styles.headerSubtitulo}>Conectamos personas con servicios</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.formulario}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Text style={styles.titulo}>Iniciar sesion</Text>
        <Text style={styles.subtitulo}>Ingresa tus credenciales para continuar</Text>

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

        {mensajeExito ? <Text style={styles.exito}>{mensajeExito}</Text> : null}
        {error        ? <Text style={styles.error}>{error}</Text>        : null}

        <TouchableOpacity style={styles.boton} onPress={handleLogin} disabled={loading}>
          {loading
            ? <ActivityIndicator color={COLORS.surface} />
            : <Text style={styles.botonTexto}>Iniciar sesion</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Registro')}>
          <Text style={styles.link}>No tienes cuenta? <Text style={styles.linkNegrita}>Registrate</Text></Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('RecuperarPassword')}
          style={styles.linkOlvide}
        >
          <Text style={styles.linkOlvideTexto}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORS.background },

  header: {
    paddingTop: 48,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius:  RADII.full,
    borderBottomRightRadius: RADII.full,
    alignItems: 'center',
  },
  headerTitulo:    { color: COLORS.surface, fontSize: 38, fontWeight: '800' },
  headerSubtitulo: { color: COLORS.primaryLight, fontSize: 14, marginTop: 6 },

  formulario: { flex: 1, paddingHorizontal: 24, paddingTop: 32 },

  titulo:    { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  subtitulo: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 28 },

  input: {
    borderWidth: 1,
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
    marginBottom:    16,
    backgroundColor: COLORS.surface,
  },
  inputTexto: { flex: 1, padding: 14, fontSize: 15, color: COLORS.textPrimary },
  ojito:      { padding: 14 },

  exito: { color: COLORS.success, marginBottom: 12, textAlign: 'center', fontSize: 13 },
  error: { color: COLORS.error,   marginBottom: 12, textAlign: 'center', fontSize: 13 },

  boton: {
    backgroundColor: COLORS.primary,
    padding:         16,
    borderRadius:    RADII.md,
    alignItems:      'center',
    marginBottom:    20,
    ...SHADOWS.boton,
  },
  botonTexto: { color: COLORS.surface, fontSize: 16, fontWeight: '700' },

  link:        { textAlign: 'center', color: COLORS.textSecondary, fontSize: 14 },
  linkNegrita: { color: COLORS.primary, fontWeight: '700' },
  linkOlvide:      { alignItems: 'center', marginTop: 16 },
  linkOlvideTexto: { color: COLORS.textMuted, fontSize: 14 },
});
