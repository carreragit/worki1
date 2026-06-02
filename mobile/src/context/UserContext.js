/**
 * UserContext — estado global del usuario autenticado.
 *
 * Guarda los datos que casi todas las pantallas necesitan:
 *   - userId       → id del usuario en auth-service (viene del JWT)
 *   - perfilId     → id del perfil en user-service
 *   - nombreCompleto → para mostrarlo en la UI sin hacer otra petición
 *   - esTrabajador → true si el usuario ya activó su perfil de trabajador
 *   - trabajadorId → id del trabajador (null si no es trabajador)
 *
 * Uso:
 *   const { user, initUser, clearUser } = useUser();
 *
 *   - Llamar initUser() justo después de hacer login exitoso.
 *   - Llamar clearUser() al cerrar sesión para limpiar el estado.
 */
import { createContext, useContext, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { getToken } from '../services/authService';
import { obtenerPerfil, verificarTrabajador } from '../services/userService';

const UserContext = createContext(null);

// Estado vacío que se usa al iniciar la app o al cerrar sesión
const EMPTY_USER = {
  userId: null,
  perfilId: null,
  nombreCompleto: null,
  esTrabajador: false,
  trabajadorId: null,
};

export function UserProvider({ children }) {
  const [user, setUser] = useState(EMPTY_USER);

  /**
   * Carga los datos del usuario autenticado.
   * Se llama una vez después de un login exitoso.
   *
   * Pasos:
   *  1. Lee el JWT guardado en el dispositivo
   *  2. Decodifica el token para obtener el userId (campo 'sub' del JWT)
   *  3. Pide el perfil al user-service usando ese userId
   *  4. Verifica si el perfil ya tiene un trabajador asociado
   */
  const initUser = async () => {
    const token = await getToken();
    const decoded = jwtDecode(token);

    // El campo 'sub' del JWT es un string con el id numérico del usuario en auth-service
    const userId = Number(decoded.sub);

    const perfil = await obtenerPerfil(userId);

    // verificarTrabajador devuelve null si el usuario no es trabajador (no lanza error)
    const trabajador = await verificarTrabajador(perfil.id);

    setUser({
      userId,
      perfilId: perfil.id,
      nombreCompleto: perfil.nombreCompleto,
      // Si trabajador no es null, el usuario tiene perfil de trabajador activo
      esTrabajador: trabajador !== null,
      trabajadorId: trabajador?.id ?? null,
    });
  };

  // Limpia el estado del usuario — usar al cerrar sesión
  const clearUser = () => setUser(EMPTY_USER);

  return (
    <UserContext.Provider value={{ user, setUser, initUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}

// Hook para acceder al contexto desde cualquier pantalla
export function useUser() {
  return useContext(UserContext);
}
