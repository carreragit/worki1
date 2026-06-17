/**
 * UserContext - estado global del usuario autenticado.
 *
 * Guardamos aquí los datos que casi todas las pantallas necesitan
 * para no tener que ir al backend en cada pantalla a buscarlos:
 *   - userId          id del usuario en auth-service (viene del JWT)
 *   - perfilId      id del perfil en user-service
 *   - nombreCompleto  para mostrarlo en la UI sin hacer otra petición
 *   - esTrabajador   true si el usuario ya activó su perfil de trabajador
 *   - trabajadorId    id del trabajador (null si no es trabajador)
 *
 * Uso desde cualquier pantalla:
 *   const { user, initUser, clearUser } = useUser();
 *
 *   - initUser()   llamar justo después de un login exitoso
 *   - clearUser() llamar al cerrar sesión para limpiar el estado
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { getToken } from '../services/authService';
import { obtenerPerfil, verificarTrabajador } from '../services/userService';

// createContext es una función nativa de React que crea el canal de comunicación
// entre el Provider y todas las pantallas que consuman el contexto.
// El null es el valor inicial-  solo aplica si useUser() se llama
// fuera del Provider, lo cual sería un error de uso.
const UserContext = createContext(null);

// Definimos EMPTY_USER fuera de la función porque tanto UserProvider como clearUser
// lo necesitan. Al vivir fuera, se crea una sola vez al importar el archivo.
// Representa el estado vacío del usuario: antes del login o después del logout.
const EMPTY_USER = {
  userId: null,
  perfilId: null,
  nombreCompleto: null,
  esTrabajador: false,
  trabajadorId: null,
};

// Exportamos UserProvider para que App.js pueda importarlo y envolver toda la app.
// El parámetro { children } le permite renderizar todo lo que se anide adentro -
// sin él, la app entera desaparecería de pantalla.
export function UserProvider({ children }) {

  const [user, setUser] = useState(EMPTY_USER);
  // null = todavía verificando, 'Login' o 'Tabs' una vez que se sabe
  const [rutaInicial, setRutaInicial] = useState(null);

  // initUser es una función asíncrona guardada en una constante.
  // Dentro de un componente React se usa const en vez de function por convención,
  // pero ambas formas son equivalentes y funcionan exactamente igual.
  // El async habilita el uso de await adentro y hace que la función retorne
  // una Promesa, permitiendo que quien la llame también pueda esperarla con await.
  const initUser = async () => {

    // await pausa la ejecución en esta línea hasta que getToken() termine.
    // Sin await, token sería una Promesa sin resolver, no el valor del JWT.
    const token = await getToken();

    // jwtDecode convierte el JWT (string cifrado) en un objeto JavaScript legible.
    const decoded = jwtDecode(token);

    // El campo 'sub' del JWT contiene el id del usuario como string.
    // Lo convertimos a número porque el backend lo espera así.
    const userId = Number(decoded.sub);

    // Vamos al backend a buscar el perfil usando el userId extraído del JWT.
    const perfil = await obtenerPerfil(userId);

    // verificarTrabajador retorna null si el usuario no tiene perfil de trabajador.
    const trabajador = await verificarTrabajador(perfil.id);

    // setUser actualiza el estado con los datos reales del usuario logueado.
    // React redibuja todas las pantallas que consuman este contexto.
    setUser({
      userId,
      perfilId: perfil.id,
      nombreCompleto: perfil.nombreCompleto,
      // Si trabajador no es null, el usuario tiene perfil de trabajador activo
      esTrabajador: trabajador !== null,
      // El operador ?. accede a id solo si trabajador no es null
      // El operador ?? retorna null si el resultado es undefined
      trabajadorId: trabajador?.id ?? null,
    });
  };

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const token = await getToken();
        if (token) {
          const decoded = jwtDecode(token);
          if (decoded.exp > Date.now() / 1000) {
            // token válido: intentar cargar datos, pero si el servicio falla
            // igual se va a Tabs — el token es válido, no es un logout
            try { await initUser(); } catch (_) {}
            setRutaInicial('Tabs');
            return;
          }
        }
      } catch (_) {
        // token corrupto o error de red → ir a Login
      }
      setRutaInicial('Login');
    };
    verificarSesion();
  }, []);

  // clearUser resetea el estado del usuario a vacío.
  // Se llama desde PerfilScreen al cerrar sesión.
  const clearUser = () => setUser(EMPTY_USER);

  // El return renderiza el Provider con el canal lleno de datos.
  // value define qué funciones y valores quedan expuestos hacia afuera -
  // solo lo que esté aquí puede ser consumido por las pantallas con useUser().
  // {children} renderiza todo lo anidado dentro de <UserProvider> en App.js.
  return (
    <UserContext.Provider value={{ user, setUser, initUser, clearUser, rutaInicial }}>
      {children}
    </UserContext.Provider>
  );
}

// useUser es un custom hook - una función propia que usa hooks nativos de React adentro.
// Actúa como wrapper de useContext para que las pantallas no tengan que
// importar UserContext directamente ni saber cómo funciona el contexto por dentro..
// Al empezar con 'use', React la reconoce como hook y permite usarla dentro de componentes.
export function useUser() {
  return useContext(UserContext);
}
