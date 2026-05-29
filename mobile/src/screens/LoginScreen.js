    // Pantalla de login nativa: primer punto de entrada de la app.
// Captura email y password, llama al gateway via authService,
// y navega al WebView si el login es exitoso.

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
import { Ionicons } from '@expo/vector-icons';
import { login } from '../services/authService';

export default function LoginScreen({ navigation, route }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const mensajeExito = route.params?.mensajeExito;

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      // replace evita que el usuario vuelva al login con el boton atras
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Text style={styles.titulo}>Worki</Text>
      <Text style={styles.subtitulo}>Inicia sesion para continuar</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
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
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!mostrarPassword}
        />
        <TouchableOpacity onPress={() => setMostrarPassword(!mostrarPassword)} style={styles.ojito}>
          <Ionicons name={mostrarPassword ? 'eye-off' : 'eye'} size={22} color="#999" />
        </TouchableOpacity>
      </View>

      {mensajeExito ? <Text style={styles.exito}>{mensajeExito}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.boton} onPress={handleLogin} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.botonTexto}>Iniciar sesion</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Registro')}>
        <Text style={styles.link}>No tienes cuenta? Registrate</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  titulo: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  subtitulo: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
  },
  inputTexto: {
    flex: 1,
    padding: 14,
    fontSize: 16,
  },
  ojito: {
    padding: 14,
  },
  exito: {
    color: '#16a34a',
    marginBottom: 12,
    textAlign: 'center',
  },
  error: {
    color: '#e53e3e',
    marginBottom: 12,
    textAlign: 'center',
  },
  boton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  botonTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    textAlign: 'center',
    color: '#2563eb',
    fontSize: 14,
  },
});
