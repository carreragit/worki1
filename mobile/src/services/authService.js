// Servicio de autenticacion: maneja las llamadas HTTP al gateway para login y registro,
// y el almacenamiento seguro del JWT en el dispositivo con expo-secure-store.

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Emulador Android usar: http://10.0.2.2:8080
// Dispositivo fisico usar: http://<tu-ip-local>:8080
const GATEWAY_URL = 'http://192.168.1.102:8080';
const JWT_KEY = 'worki_jwt';

const api = axios.create({
  baseURL: GATEWAY_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export const login = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password });
  const { token } = response.data;
  await SecureStore.setItemAsync(JWT_KEY, token);
  return token;
};

export const registro = async (nombre, email, password, codigoReferido = null) => {
  const response = await api.post('/api/auth/registro', {
    nombre,
    email,
    password,
    ...(codigoReferido && { codigoReferido }),
  });
  return response.data;
};

export const getToken = async () => {
  return await SecureStore.getItemAsync(JWT_KEY);
};

export const logout = async () => {
  await SecureStore.deleteItemAsync(JWT_KEY);
};
