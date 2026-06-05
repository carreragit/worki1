/**
 * solicitudService — peticiones al interaction-service para solicitudes de trabajo.
 *
 * Todas las rutas pasan por el gateway (8080) → interaction-service (8084).
 * El gateway inyecta X-User-Id a partir del JWT, por eso el interaction-service
 * sabe quién es el cliente sin que el frontend lo mande explícitamente.
 */
import axios from 'axios';
import { getToken } from './authService';

const GATEWAY_URL = 'http://192.168.1.102:8080';

/**
 * Crea una nueva solicitud de servicio.
 * El clienteId lo extrae el backend del header X-User-Id que pone el gateway.
 *
 * @param {object} params
 * @param {number} params.trabajadorId
 * @param {number} params.oficioId — oficio específico que se está solicitando
 * @param {string} params.descripcion
 * @param {string} params.fechaHoraPreferida — ISO 8601 (ej. "2025-06-10T10:00:00")
 * @param {string} params.direccion
 */
export const crearSolicitud = async ({ trabajadorId, oficioId, descripcion, fechaHoraPreferida, direccion }) => {
  const token = await getToken();
  const response = await axios.post(
    `${GATEWAY_URL}/api/interacciones/solicitudes`,
    { trabajadorId, oficioId, descripcion, fechaHoraPreferida, direccion },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
  return response.data;
};

/**
 * Lista todas las solicitudes hechas por un cliente.
 * Usada en SolicitudesScreen cuando el usuario NO es trabajador.
 *
 * @param {number} clienteId — perfilId del cliente
 */
export const listarPorCliente = async (clienteId) => {
  const token = await getToken();
  const res = await axios.get(
    `${GATEWAY_URL}/api/interacciones/solicitudes/cliente/${clienteId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

/**
 * Lista todas las solicitudes recibidas por un trabajador.
 * Usada en SolicitudesScreen cuando el usuario ES trabajador.
 *
 * @param {number} trabajadorId
 */
export const listarPorTrabajador = async (trabajadorId) => {
  const token = await getToken();
  const res = await axios.get(
    `${GATEWAY_URL}/api/interacciones/solicitudes/trabajador/${trabajadorId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

/**
 * Cambia el estado de una solicitud (ej. PENDIENTE → ACEPTADA, COMPLETADA, etc.).
 * Solo el trabajador puede aceptar/rechazar; ambas partes pueden marcarla como completada.
 *
 * @param {number} id — id de la solicitud
 * @param {string} estado — nuevo estado (ver enum Estado en el backend)
 */
export const actualizarEstado = async (id, estado) => {
  const token = await getToken();
  const res = await axios.patch(
    `${GATEWAY_URL}/api/interacciones/solicitudes/${id}/estado`,
    { estado },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
  return res.data;
};
