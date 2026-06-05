import axios from 'axios';
import { getToken } from './authService';

const GATEWAY_URL = 'http://192.168.1.102:8080';

export const crearSolicitud = async ({ trabajadorId, oficioId, descripcion, fechaHoraPreferida, direccion }) => {
  const token = await getToken();
  const response = await axios.post(
    `${GATEWAY_URL}/api/interacciones/solicitudes`,
    { trabajadorId, oficioId, descripcion, fechaHoraPreferida, direccion },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
  return response.data;
};
