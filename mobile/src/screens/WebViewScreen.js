// Pantalla post-login: carga el frontend web React dentro de un WebView,
// inyectando el JWT como query param para que el frontend inicie sesion automaticamente.

import { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { getToken, logout } from '../services/authService';

// Emulador Android usar: http://10.0.2.2:5173
// Dispositivo fisico usar: http://<tu-ip-local>:5173
const FRONTEND_URL = 'http://192.168.10.109:5173';

export default function WebViewScreen({ navigation }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    const cargarUrl = async () => {
      const token = await getToken();
      setUrl(`${FRONTEND_URL}?token=${token}`);
    };
    cargarUrl();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  if (!url) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ uri: url }}
        style={{ flex: 1 }}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        )}
      />
      <TouchableOpacity style={styles.botonLogout} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  botonLogout: {
    position: 'absolute',
    top: 48,
    right: 16,
    backgroundColor: '#e53e3e',
    borderRadius: 24,
    padding: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});
