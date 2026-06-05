// Servicio de mensajes: llamadas HTTP para historial e imágenes.
// La comunicación en tiempo real va por WebSocket (ver ChatScreen).
import axios from 'axios';
import { getToken } from './authService';

const GATEWAY_URL = 'http://192.168.1.102:8080';
// El WebSocket se conecta directamente al interaction-service sin pasar por el gateway
const WS_BASE_URL = 'ws://192.168.1.102:8084';

const authHeaders = async () => {
  const token = await getToken();
  return { Authorization: `Bearer ${token}` };
};

// Carga el historial de mensajes al abrir el chat
export const cargarHistorial = async (solicitudId) => {
  const headers = await authHeaders();
  const res = await axios.get(
    `${GATEWAY_URL}/api/interacciones/mensajes/${solicitudId}`,
    { headers }
  );
  return res.data;
};

// Sube una imagen y devuelve su URL para enviarla como mensaje
export const subirImagen = async (uri) => {
  const token = await getToken();
  const formData = new FormData();
  const nombreArchivo = uri.split('/').pop();
  const tipo = nombreArchivo.endsWith('.png') ? 'image/png' : 'image/jpeg';
  // FormData acepta el objeto con uri, name y type para React Native
  formData.append('imagen', { uri, name: nombreArchivo, type: tipo });
  const res = await axios.post(
    `${GATEWAY_URL}/api/interacciones/mensajes/imagen`,
    formData,
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
  );
  return res.data.url; // URL de la imagen subida
};

export { WS_BASE_URL };
