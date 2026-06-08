// Servicio de autenticacion: maneja las llamadas HTTP al gateway para login y registro,
// y el almacenamiento del JWT. En móvil usa expo-secure-store; en web usa localStorage
// porque expo-secure-store no está disponible en el navegador.

import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { GATEWAY_URL } from './config';
const JWT_KEY = 'worki_jwt';

const api = axios.create({
  baseURL: GATEWAY_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export const login = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password });
  const { token } = response.data;
  if (Platform.OS === 'web') {
    localStorage.setItem(JWT_KEY, token);
  } else {
    await SecureStore.setItemAsync(JWT_KEY, token);
  }
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
  if (Platform.OS === 'web') {
    return localStorage.getItem(JWT_KEY);
  }
  return await SecureStore.getItemAsync(JWT_KEY);
};

export const logout = async () => {
  if (Platform.OS === 'web') {
    localStorage.removeItem(JWT_KEY);
  } else {
    await SecureStore.deleteItemAsync(JWT_KEY);
  }
};
