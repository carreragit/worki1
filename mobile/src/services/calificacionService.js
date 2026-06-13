/**
 * calificacionService — peticiones al interaction-service para calificaciones.
 *
 * Una calificación se crea cuando una solicitud llega a estado COMPLETADA.
 * Tanto el cliente como el trabajador pueden calificarse mutuamente
 * (evaluadorId = quien califica, evaluadoId = quien recibe la calificación).
 */
import axios from 'axios';
import { getToken } from './authService';

import { GATEWAY_URL } from './config';

// Helper para no repetir la lógica del header en cada función
const authHeaders = async () => {
  const token = await getToken();
  return { Authorization: `Bearer ${token}` };
};

/**
 * Crea una calificación al terminar una solicitud.
 *
 * @param {object} params
 * @param {number} params.solicitudId — solicitud que se está calificando
 * @param {number} params.oficioId   — oficio asociado a esa solicitud
 * @param {number} params.evaluadorId — perfilId de quien califica
 * @param {number} params.evaluadoId  — perfilId de quien recibe la calificación
 * @param {number} params.puntaje     — valor numérico (ej. 1–5)
 * @param {string} params.comentario
 */
export const crearCalificacion = async ({ solicitudId, oficioId, evaluadorId, evaluadoId, puntaje, comentario }) => {
  const headers = await authHeaders();
  const res = await axios.post(
    `${GATEWAY_URL}/api/interacciones/calificaciones`,
    { solicitudId, oficioId, evaluadorId, evaluadoId, puntaje, comentario },
    { headers }
  );
  return res.data;
};

/**
 * Obtiene todas las calificaciones que recibió un trabajador.
 * Se usa en PerfilTecnicoScreen para mostrar el historial de reseñas.
 *
 * @param {number} trabajadorId
 */
export const listarPorTrabajador = async (trabajadorId) => {
  const headers = await authHeaders();
  const res = await axios.get(
    `${GATEWAY_URL}/api/interacciones/calificaciones/usuario/${trabajadorId}`,
    { headers }
  );
  return res.data;
};

/**
 * Obtiene las calificaciones asociadas a una solicitud concreta.
 * Útil para saber si el usuario ya calificó antes de mostrar el botón "Calificar".
 *
 * @param {number} solicitudId
 */
export const listarPorSolicitud = async (solicitudId) => {
  const headers = await authHeaders();
  const res = await axios.get(
    `${GATEWAY_URL}/api/interacciones/calificaciones/solicitud/${solicitudId}`,
    { headers }
  );
  return res.data;
};

/**
 * Lista las calificaciones de un oficio específico.
 * Usado en PerfilTecnicoScreen para mostrar reseñas del oficio seleccionado.
 *
 * @param {number} oficioId
 */
export const listarPorOficio = async (oficioId) => {
  const headers = await authHeaders();
  const res = await axios.get(
    `${GATEWAY_URL}/api/interacciones/calificaciones/oficio/${oficioId}`,
    { headers }
  );
  return res.data;
};
