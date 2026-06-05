/**
 * userService — peticiones al user-service a través del gateway.
 *
 * Cubre perfiles y trabajadores. Las rutas pasan por el gateway (8080),
 * que agrega los headers de contexto (X-User-Id, X-User-Role, etc.)
 * antes de reenviar al user-service (8082).
 */
import axios from 'axios';
import { getToken } from './authService';

import { GATEWAY_URL } from './config';

// Helper para construir el header de autorización sin repetirlo en cada función
const authHeaders = async () => {
  const token = await getToken();
  return { Authorization: `Bearer ${token}` };
};

/**
 * Obtiene el perfil de un usuario por su id de auth-service.
 * @param {number} usuarioId — id del usuario (viene del JWT, campo 'sub')
 * @returns {object} perfil con id, nombreCompleto, etc.
 */
export const obtenerPerfil = async (usuarioId) => {
  const headers = await authHeaders();
  const res = await axios.get(`${GATEWAY_URL}/api/perfiles/usuario/${usuarioId}`, { headers });
  return res.data;
};

/**
 * Verifica si un perfil ya tiene un trabajador activo.
 *
 * Devuelve el objeto trabajador si existe, o null si no.
 * El try/catch es intencional: un usuario que nunca activó su perfil
 * de trabajador devuelve 404, lo cual no es un error de la app.
 *
 * @param {number} perfilId — id del perfil (NO el userId)
 * @returns {object|null} datos del trabajador, o null si no existe
 */
// Returns the worker if it exists, null if not (does NOT throw on 404/500)
export const verificarTrabajador = async (perfilId) => {
  const headers = await authHeaders();
  try {
    const res = await axios.get(`${GATEWAY_URL}/api/trabajadores/perfil/${perfilId}`, { headers });
    return res.data;
  } catch {
    // Cualquier error (404, 500, red) se trata como "no es trabajador"
    // para no romper el flujo de login
    return null;
  }
};

/**
 * Activa el perfil de trabajador para un perfil existente.
 * Se llama desde ActivarTrabajadorScreen la primera vez que el usuario
 * quiere ofrecer servicios.
 *
 * @param {object} params
 * @param {number} params.perfilId
 * @param {number} params.latitud
 * @param {number} params.longitud
 * @param {number} params.radioKm — radio en km en el que el trabajador acepta trabajos
 */
export const activarTrabajador = async ({ perfilId, latitud, longitud, radioKm }) => {
  const headers = await authHeaders();
  const res = await axios.post(`${GATEWAY_URL}/api/trabajadores`,
    { perfilId, latitud, longitud, radioKm },
    { headers }
  );
  return res.data;
};

/**
 * Registra un nuevo oficio (especialidad) para un trabajador.
 * Un trabajador puede tener varios oficios.
 *
 * @param {object} params
 * @param {number} params.trabajadorId
 * @param {string} params.especialidad — categoría (ej. "PLOMERIA")
 * @param {string} params.nombreServicio
 * @param {string} params.descripcionServicio
 * @param {number} params.tarifaHora
 * @param {number} params.tarifaServicioBase
 */
export const crearOficio = async ({ trabajadorId, especialidad, nombreServicio, descripcionServicio, tarifaHora, tarifaServicioBase }) => {
  const headers = await authHeaders();
  const res = await axios.post(`${GATEWAY_URL}/api/oficios`,
    { trabajadorId, especialidad, nombreServicio, descripcionServicio, tarifaHora, tarifaServicioBase },
    { headers }
  );
  return res.data;
};
