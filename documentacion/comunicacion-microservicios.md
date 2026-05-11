# Worki — Guía de Comunicación entre Microservicios
> Referencia técnica para el equipo de desarrollo

---

## Reglas de oro

> ⚠️ **El frontend NUNCA habla directamente con los microservicios.**
> Todas las peticiones del frontend pasan por el Gateway. Los microservicios nunca son accesibles directamente desde el exterior.

> ⚠️ **Ningún microservicio accede a la base de datos de otro.**
> Si un microservicio necesita datos de otro dominio, hace una llamada HTTP interna al microservicio dueño de esos datos.

---

## Flujo general

El flujo siempre sigue esta dirección:

```
Frontend  →  Gateway (8080)  →  Microservicio correspondiente
```

El Gateway analiza el path de cada petición y la redirige al microservicio correcto:

| Path recibido en Gateway | Puerto | Microservicio |
|---|---|---|
| `/api/auth/**` | 8081 | Auth Service |
| `/api/usuarios/**` | 8082 | User Service |
| `/api/publicaciones/**` | 8083 | Publication Service |
| `/api/interacciones/**` | 8084 | Interaction Service |

---

## Gateway y validación JWT

El Gateway valida el JWT en cada petición entrante. **Los microservicios no saben nada de JWT**, simplemente reciben la petición y responden. Si la petición llegó a un microservicio, el Gateway ya validó que el token era correcto.

### Rutas públicas (sin JWT)

Estas rutas el Gateway deja pasar sin validar token porque el usuario todavía no tiene uno:

```
/api/auth/login      →  pasa sin validar JWT
/api/auth/registro   →  pasa sin validar JWT
```

### Rutas protegidas (requieren JWT)

Todo lo demás requiere JWT válido. Si la petición no trae token o el token es inválido, el Gateway rechaza con `401 Unauthorized` y la petición **nunca llega** al microservicio:

```
/api/usuarios/**        →  requiere JWT
/api/publicaciones/**   →  requiere JWT
/api/interacciones/**   →  requiere JWT
```

### Cómo los microservicios saben quién es el usuario

El Gateway extrae los datos del usuario desde el JWT y los pasa como headers HTTP a cada microservicio. Los microservicios leen estos headers para saber quién hace la petición **sin tocar el JWT directamente**:

```
X-User-Id:    123
X-User-Email: usuario@email.com
X-User-Role:  TRABAJADOR
```

> 💡 **Para obtener el ID del usuario en tu controller**, lee el header `X-User-Id`. No necesitas validar JWT ni llamar a Auth Service.

---

## Comunicación entre microservicios

Cuando un microservicio necesita datos de otro, hace una llamada HTTP interna **directamente al puerto del servicio destino**, sin pasar por el Gateway.

### Mapa de dependencias

| Servicio que necesita | Servicio que provee | Dato solicitado |
|---|---|---|
| Publication Service | User Service | Perfil del trabajador para mostrar en resultados de búsqueda |
| Interaction Service | User Service | Perfil del usuario para mostrar en calificaciones y solicitudes |
| Interaction Service | Publication Service | Datos de la publicación asociada a una solicitud |

### Auth Service es completamente independiente

> ✅ **Auth Service no llama a ningún otro microservicio.** Es el servicio más aislado del sistema. Solo recibe peticiones de login y registro, genera JWT y responde.

### Cómo hacer una llamada interna entre microservicios

Se usa `RestTemplate` o `WebClient` de Spring. La llamada va directamente al puerto del microservicio destino, sin pasar por el Gateway:

```java
// Ejemplo: Interaction Service necesita datos de User Service
// Llama directamente al puerto 8082, no al Gateway
GET http://localhost:8082/internal/usuarios/{id}
```

> 💡 **Convención para endpoints internos:** Los endpoints que solo son para comunicación entre microservicios deben tener el prefijo `/internal/` en su path. Por ejemplo: `/internal/usuarios/{id}`. Esto deja claro que ese endpoint no es público.

---

## Ejemplos de flujo completo

### Usuario hace login

```
1. Frontend  →  POST /api/auth/login  →  Gateway
2. Gateway   →  ruta pública, deja pasar sin validar JWT
3. Gateway   →  redirige a Auth Service (8081)
4. Auth Service  →  valida credenciales  →  genera JWT
5. Auth Service  →  responde con {token: 'eyJ...'}
6. Gateway   →  retorna respuesta al Frontend
7. Frontend  →  guarda el JWT
```

### Cliente busca servicios con geolocalización

```
1. Frontend  →  GET /api/publicaciones/buscar?lat=&lng=&radio=5  +  JWT
2. Gateway   →  valida JWT  →  extrae userId, rol
3. Gateway   →  agrega headers X-User-Id, X-User-Role
4. Gateway   →  redirige a Publication Service (8083)
5. Publication Service  →  ejecuta búsqueda con Haversine
6. Publication Service  →  llama a User Service (8082) para obtener
   datos del trabajador de cada resultado
7. Publication Service  →  retorna lista ordenada por distancia
8. Gateway   →  retorna respuesta al Frontend
```

### Cliente califica a un trabajador

```
1. Frontend  →  POST /api/interacciones/calificaciones  +  JWT
2. Gateway   →  valida JWT  →  agrega headers
3. Gateway   →  redirige a Interaction Service (8084)
4. Interaction Service  →  lee X-User-Id del header (el calificador)
5. Interaction Service  →  verifica que existe solicitud ACEPTADA
6. Interaction Service  →  guarda la calificación en su BD
7. Interaction Service  →  llama a User Service para actualizar
   el rating promedio del trabajador
8. Interaction Service  →  retorna confirmación
```

---

## Resumen práctico para el desarrollo

### ✅ Lo que SÍ debes hacer en tu microservicio

- Leer el header `X-User-Id` para saber quién hace la petición
- Exponer endpoints `/internal/**` para que otros servicios te consulten
- Llamar directamente al puerto del servicio que necesitas (sin pasar por Gateway)
- Manejar el caso en que el servicio que llamas no responde (try/catch)

### ❌ Lo que NO debes hacer en tu microservicio

- Conectarte a la base de datos de otro microservicio
- Validar el JWT tú mismo — eso lo hace el Gateway
- Llamar al Gateway para comunicarte con otro microservicio — llama directo al puerto
- Duplicar datos de otro microservicio en tu base de datos

---

## Puertos de referencia rápida

| Servicio | Puerto | URL local | Schema BD |
|---|---|---|---|
| Gateway | 8080 | localhost:8080 | — (sin BD) |
| Auth Service | 8081 | localhost:8081 | worki_auth_db |
| User Service | 8082 | localhost:8082 | worki_user_db |
| Publication Service | 8083 | localhost:8083 | worki_publication_db |
| Interaction Service | 8084 | localhost:8084 | worki_interaction_db |
| Frontend | 5173 | localhost:5173 | — |
| MySQL (XAMPP) | 3306 | localhost:3306 | — |
