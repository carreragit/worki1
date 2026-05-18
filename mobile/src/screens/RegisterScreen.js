// Pantalla de registro nativa: permite crear una cuenta nueva.
// Tras el registro exitoso vuelve al Login con un mensaje para que el usuario verifique su email.

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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { registro } from '../services/authService';

export default function RegisterScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [codigoReferido, setCodigoReferido] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

    if (!nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('El email no tiene formato valido');
      return;
    }

    const errorPassword = validarPassword(password);
    if (errorPassword) {
      setError(errorPassword);
      return;
    }

    if (password !== confirmarPassword) {
      setError('Las contrasenas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await registro(nombre, email, password, codigoReferido || null);
      // Volver al Login con mensaje: el usuario debe verificar su email antes de ingresar
      navigation.navigate('Login', { mensajeExito: 'Cuenta creada. Revisa tu email para verificarla.' });
    } catch (e) {
      const msg = e.response?.data?.error || 'Error al registrarse. Intenta nuevamente.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.titulo}>Crear cuenta</Text>
        <Text style={styles.subtitulo}>Completa tus datos para registrarte</Text>

        <TextInput
          style={styles.input}
          placeholder="Nombre completo"
          value={nombre}
          onChangeText={setNombre}
          autoCapitalize="words"
          autoCorrect={false}
        />

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
        <Text style={styles.hint}>
          Minimo 8 caracteres, una mayuscula, una minuscula, un numero y un caracter especial
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputTexto}
            placeholder="Confirmar contrasena"
            value={confirmarPassword}
            onChangeText={setConfirmarPassword}
            secureTextEntry={!mostrarConfirmar}
          />
          <TouchableOpacity onPress={() => setMostrarConfirmar(!mostrarConfirmar)} style={styles.ojito}>
            <Ionicons name={mostrarConfirmar ? 'eye-off' : 'eye'} size={22} color="#999" />
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Codigo de referido (opcional)"
          value={codigoReferido}
          onChangeText={setCodigoReferido}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.boton} onPress={handleRegistro} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.botonTexto}>Crear cuenta</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Ya tienes cuenta? Inicia sesion</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
    backgroundColor: '#fff',
  },
  titulo: {
    fontSize: 32,
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
  hint: {
    fontSize: 12,
    color: '#999',
    marginBottom: 16,
    marginTop: -8,
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