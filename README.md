# Worki

Worki es una plataforma de marketplace de servicios técnicos del hogar para el mercado chileno. Conecta a clientes que necesitan servicios (gasfitería, electricidad, carpintería, entre otros) con trabajadores calificados cercanos, facilitando la búsqueda, contratación y calificación dentro de una misma aplicación.

El proyecto está desarrollado como proyecto de título y consta de una aplicación móvil nativa (Expo / React Native), una interfaz web responsiva (React Native Web con Expo, reutilizando la misma base de código de la app móvil), y un backend en arquitectura de microservicios (Spring Boot + MySQL).

---

## Tabla de Contenidos

- [Arquitectura general](#arquitectura-general)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Tecnologías](#tecnologías)
- [Modelo de negocio](#modelo-de-negocio)
- [Requisitos previos](#requisitos-previos)
- [Setup local — sin Docker](#setup-local--sin-docker)
- [Setup con Docker Compose](#setup-con-docker-compose)
- [Endpoints principales](#endpoints-principales)
- [Tests E2E](#tests-e2e)
- [Flujo de trabajo en Git](#flujo-de-trabajo-en-git)
- [Equipo](#equipo)

---

## Arquitectura general

El sistema sigue una arquitectura de microservicios donde todo el tráfico externo pasa obligatoriamente por el Gateway. Los microservicios nunca son accesibles directamente desde el exterior.

```
App Móvil (Expo)   /   Interfaz Web (React Native Web + Expo)
             |
             v
      Gateway — puerto 8080
      (valida JWT, enruta, inyecta headers de usuario)
             |
    _________|____________________________________________
    |              |                |
Auth Service   User Service   Interaction Service
  (8081)         (8082)           (8084)
```

### Enrutamiento del Gateway

| Path recibido             | Puerto | Microservicio       |
|---------------------------|--------|---------------------|
| `/api/auth/**`            | 8081   | Auth Service        |
| `/api/usuarios/**`        | 8082   | User Service        |
| `/api/interacciones/**`   | 8084   | Interaction Service |

### Comunicación entre microservicios

Cuando un microservicio necesita datos de otro, hace una llamada HTTP **directamente al puerto del servicio destino**, sin pasar por el Gateway. El Gateway extrae los datos del usuario desde el JWT y los inyecta como headers HTTP:

```
X-User-Id:    123
X-User-Email: usuario@email.com
X-User-Role:  TRABAJADOR
```

Los microservicios leen estos headers para identificar al usuario sin necesidad de procesar el JWT por cuenta propia.

### Rutas públicas (sin autenticación)

```
POST /api/auth/login
POST /api/auth/registro
```

El resto de los endpoints requiere un token JWT válido en el header `Authorization: Bearer <token>`.

---

## Estructura del repositorio

```
worki/
├── backend/
│   ├── gateway/                  # API Gateway — enrutamiento y validación JWT
│   ├── auth-service/             # Autenticación, registro, JWT y sistema de referidos
│   ├── user-service/             # Perfiles, oficios, búsqueda por geolocalización
│   ├── interaction-service/      # Solicitudes, chat en tiempo real, calificaciones y comprobantes
│   └── pom.xml                   # POM padre (Spring Boot 3.5, Java 17)
├── mobile/
│   ├── App.js                    # Punto de entrada, Stack Navigator principal
│   └── src/
│       ├── context/
│       │   └── UserContext.js    # Estado global del usuario autenticado (compartido con web)
│       ├── navigation/           # Tab Navigator (móvil) / Sidebar (web)
│       ├── screens/              # Pantallas reutilizadas en web vía React Native Web
│       │   ├── LoginScreen.js
│       │   ├── RegisterScreen.js
│       │   ├── HomeScreen.js
│       │   ├── PerfilScreen.js
│       │   ├── PerfilTecnicoScreen.js
│       │   ├── CrearSolicitudScreen.js
│       │   ├── SolicitudesScreen.js
│       │   ├── DetalleSolicitudScreen.js
│       │   ├── CalificarScreen.js
│       │   ├── ActivarTrabajadorScreen.js
│       │   └── ChatScreen.js
│       └── services/
│           ├── config.js          # URL del Gateway y WebSocket — único punto de configuración
│           ├── authService.js
│           ├── userService.js
│           ├── solicitudService.js
│           ├── calificacionService.js
│           └── mensajeService.js
├── documentacion/                 # Documentación técnica y de gestión
├── docker-compose.yml             # Levanta todo el backend con Docker
└── flujo.md                       # Convenciones de ramas y ambientes
```

> La interfaz web no es un proyecto separado. Utiliza React Native Web con Expo para ejecutar la misma base de código de `mobile/` en el navegador, adaptando la navegación a un layout de escritorio con sidebar.

---

## Tecnologías

### Backend

| Componente           | Tecnología                               |
|----------------------|------------------------------------------|
| Framework            | Spring Boot 3.5                          |
| Lenguaje             | Java 17                                  |
| Build                | Maven (multi-módulo)                     |
| Base de datos        | MySQL 8.0                                |
| ORM                  | Spring Data JPA / Hibernate              |
| Seguridad            | JWT (validación centralizada en Gateway) |
| Chat en tiempo real  | WebSocket (STOMP)                        |
| Contenedores         | Docker + Docker Compose                  |
| Documentación API    | Springdoc OpenAPI (Swagger UI)           |

### App Móvil y Frontend Web

Ambas interfaces comparten la misma base de código. La app móvil corre en dispositivos Android mediante Expo; la interfaz web corre en el navegador mediante React Native Web con Expo, adaptando la navegación a un layout de escritorio con sidebar.

| Componente           | Tecnología                                                        |
|----------------------|-------------------------------------------------------------------|
| Framework            | Expo SDK 54 + React Native 0.81                                   |
| Web                  | React Native Web (mismo código, ejecutado en el navegador)        |
| Lenguaje             | JavaScript (JSX)                                                  |
| Navegación           | React Navigation (Stack + Tabs en móvil / Sidebar en web)         |
| HTTP                 | Axios                                                             |
| WebSocket            | @stomp/stompjs                                                    |
| Almacenamiento JWT   | expo-secure-store (nativo) / localStorage (web)                   |
| Geolocalización      | expo-location                                                     |
| Estado global        | Context API (UserContext)                                         |
| Archivos             | expo-document-picker, expo-image-picker                           |

---

## Modelo de negocio

Worki opera bajo un modelo de marketplace con dos fuentes de ingreso:

| Fuente                   | Descripción                                                       |
|--------------------------|-------------------------------------------------------------------|
| Comisión por transacción | Porcentaje sobre la mano de obra de cada trabajo completado       |
| Suscripción destacado    | Pago mensual por mayor visibilidad en los resultados de búsqueda  |

El precio publicado corresponde exclusivamente a mano de obra. Los materiales y repuestos siempre corren por cuenta del cliente y se cotizan aparte, en línea con cómo opera el mercado real. Los pagos se implementan en ambiente sandbox (Mercado Pago o Stripe) para efectos académicos.

### Publicaciones y oficios

No existe un microservicio de publicaciones separado. Cada `PerfilOficio` dentro de `user-service` actúa como publicación: cuando un trabajador configura su perfil de gasfiter con precio, especialidad y ubicación, ese perfil aparece automáticamente como resultado en las búsquedas. `BusquedaService` lista los `PerfilOficio` aplicando filtros por oficio, ubicación (Haversine) y disponibilidad.

Los perfiles con suscripción activa (`destacado: true`) aparecen priorizados en los resultados de búsqueda.

### Comprobantes y disputas

Ante reclamos sobre materiales, tanto el cliente como el trabajador pueden subir comprobantes (boletas, fotos, PDFs) asociados a una solicitud específica. El módulo `comprobante` vive dentro de `interaction-service` y permite que un administrador revise la evidencia y resuelva la disputa.

---

## Requisitos previos

- Java 17 o superior
- Maven 3.9 o superior (o usar el wrapper `./mvnw` incluido)
- MySQL 8.0 (XAMPP, instalación local o contenedor Docker)
- Node.js 18 o superior + npm
- Expo CLI (`npm install -g expo-cli`) — para la app móvil y la interfaz web

---

## Setup local — sin Docker

### 1. Crear las bases de datos

Conectarse a MySQL en el puerto 3306 y ejecutar:

```sql
-- Entorno de desarrollo
CREATE DATABASE worki_auth_db;
CREATE DATABASE worki_user_db;
CREATE DATABASE worki_interaction_db;

-- Entorno de pruebas (E2E)
CREATE DATABASE worki_user_db_test;
CREATE DATABASE worki_interaction_db_test;
```

`worki_auth_db_test` se crea automáticamente al levantar `auth-service` con el perfil `test`.

### 2. Generar el JWT secret

El secret debe ser idéntico en `auth-service` y `gateway`. Generarlo una sola vez:

**PowerShell:**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Max 256) }))
```

**Git Bash / Linux / macOS:**
```bash
openssl rand -base64 32
```

### 3. Crear los archivos de configuración local

Estos archivos no están en el repositorio (están en `.gitignore`). Cada integrante los crea manualmente.

**`backend/auth-service/src/main/resources/application-local.properties`:**
```properties
spring.datasource.password=TU_PASSWORD_MYSQL
jwt.secret=EL_SECRET_GENERADO
```

**`backend/gateway/src/main/resources/application-local.properties`:**
```properties
jwt.secret=EL_SECRET_GENERADO
```

**`backend/user-service/src/main/resources/application-local.properties`:**
```properties
spring.datasource.password=TU_PASSWORD_MYSQL
```

**`backend/interaction-service/src/main/resources/application-local.properties`:**
```properties
spring.datasource.password=TU_PASSWORD_MYSQL
```

> El `jwt.secret` debe ser exactamente el mismo en `auth-service` y `gateway`.

### 4. Levantar los microservicios

Desde la carpeta `backend/`, abrir una terminal por cada servicio:

**Modo desarrollo (base de datos real):**
```powershell
.\mvnw -pl gateway spring-boot:run
.\mvnw -pl auth-service spring-boot:run
.\mvnw -pl user-service spring-boot:run
.\mvnw -pl interaction-service spring-boot:run
```

**Modo pruebas (base de datos de test):**
```powershell
.\mvnw -pl gateway spring-boot:run
.\mvnw -pl auth-service spring-boot:run -Dspring-boot.run.profiles=local,test
.\mvnw -pl user-service spring-boot:run -Dspring-boot.run.profiles=local,test
.\mvnw -pl interaction-service spring-boot:run -Dspring-boot.run.profiles=local,test
```

> En modo test el registro deja el email verificado automáticamente, sin necesitar SMTP ni copiar links de la consola.

### 5. Levantar la app móvil o la interfaz web

Desde la carpeta `mobile/`:

```powershell
npm install        # Solo la primera vez
npm start          # Inicia el servidor de Expo
```

Luego escanear el QR con Expo Go o ejecutar directamente:

```powershell
npm run android    # Emulador Android
npm run ios        # Simulador iOS (solo macOS)
npm run web        # Interfaz web en el navegador
```

### 6. Configurar la URL del backend

El archivo `mobile/src/services/config.js` es el único punto de configuración de URLs, tanto para la app móvil como para la interfaz web. Modificarlo cuando cambie la IP de la máquina o se despliegue en la nube:

```js
// mobile/src/services/config.js
export const GATEWAY_URL = process.env.EXPO_PUBLIC_GATEWAY_URL ?? 'http://192.168.X.X:8080';
export const WS_URL      = process.env.EXPO_PUBLIC_WS_URL      ?? 'ws://192.168.X.X:8084';
```

> `WS_URL` apunta directamente al `interaction-service` (puerto 8084) porque el Gateway no proxea conexiones WebSocket.

---

## Setup con Docker Compose

El archivo `docker-compose.yml` en la raíz levanta MySQL y los cuatro microservicios del backend en contenedores.

### 1. Crear el archivo `.env` en la raíz del repositorio

```env
MYSQL_ROOT_PASSWORD=tu_password_segura
JWT_SECRET=el_secret_generado_en_base64
GATEWAY_URL=https://api.necesitoworki.com   # Opcional, solo en producción
```

### 2. Construir y levantar los servicios

```bash
docker compose up --build
```

> En el primer arranque Docker construye las imágenes. Los microservicios esperan a que MySQL esté listo mediante un healthcheck antes de intentar conectarse.

### Puertos expuestos

| Servicio            | Puerto |
|---------------------|--------|
| Gateway             | 8080   |
| Auth Service        | 8081   |
| User Service        | 8082   |
| Interaction Service | 8084   |
| MySQL               | 3306   |

---

## Endpoints principales

La documentación completa de cada microservicio está disponible en Swagger UI (acceso directo al servicio, sin pasar por el Gateway):

```
http://localhost:8081/swagger-ui/index.html   # Auth Service
http://localhost:8082/swagger-ui/index.html   # User Service
http://localhost:8084/swagger-ui/index.html   # Interaction Service
```

### Flujo básico de prueba con Postman

**1. Registro:**
```
POST http://localhost:8080/api/auth/registro
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "MiPassword123!"
}
```

**2. Verificar email:**
En modo test la verificación es automática. En modo desarrollo, copiar el link que aparece en la consola del `auth-service` y abrirlo en el navegador.

**3. Login:**
```
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "MiPassword123!"
}
```

La respuesta contiene el JWT. Incluirlo en todas las peticiones posteriores:
```
Authorization: Bearer eyJ...
```

---

## Tests E2E

Los tests de integración prueban el flujo completo del sistema haciendo peticiones HTTP reales contra los servicios en ejecución. Las pruebas cubren autenticación, gestión de perfiles, búsqueda geográfica (Haversine), solicitudes, calificaciones, sistema de referidos y chat WebSocket.

### Requisito previo

Los cuatro microservicios deben estar corriendo en modo test (ver paso 4 del setup). Esperar a que los cuatro indiquen `Started ... in X seconds` antes de ejecutar los tests.

### Ejecutar los tests

Desde la carpeta `backend/`:

```powershell
.\mvnw -pl auth-service test
.\mvnw -pl user-service test
.\mvnw -pl interaction-service test
```

Si los servicios no están corriendo, los tests se marcan como `SKIPPED` en lugar de `FAILED`.

### Cobertura

| Microservicio       | Tests | Qué prueba                                                                                        |
|---------------------|-------|---------------------------------------------------------------------------------------------------|
| auth-service        | 5     | Registro, login con JWT, email duplicado (409), password incorrecta (401), password débil (400)   |
| user-service        | 12    | CRUD de perfiles, registro de trabajadores, creación y búsqueda de oficios                        |
| interaction-service | 15    | Crear solicitud, aceptar, completar, calificar, listar, promedios de calificación                 |

Las pruebas funcionales adicionales (casos CP-01 al CP-14) se ejecutaron con Postman y DBeaver, cubriendo también el Gateway, el chat WebSocket y el sistema de referidos. El detalle está en el plan de pruebas del repositorio.

> Ejecutar los tests antes de mergear cualquier rama hacia `testing`.

---

## Flujo de trabajo en Git

Las ramas de desarrollo se mergean hacia `testing`, no directamente a `main`. La rama `testing` actúa como rama de integración y validación.

```
feature/mi-funcionalidad  -->  testing  -->  main
```

**Convención de ramas:**

| Prefijo    | Uso                                |
|------------|------------------------------------|
| `feature/` | Nueva funcionalidad                |
| `fix/`     | Corrección de errores              |
| `test/`    | Ramas de prueba de integración     |

**Antes de mergear a `testing`:**
1. Ejecutar los tests E2E localmente y confirmar que todos pasan.
2. Verificar que los servicios arrancan correctamente en modo desarrollo.

La rama `testing` permite trabajar con la base de datos de prueba sin afectar la base de datos de desarrollo compartida entre ramas.

---

## Equipo

El frontend (móvil y web) fue desarrollado en conjunto por los tres integrantes, siendo cada uno responsable de la sección correspondiente a su microservicio.

| Nombre                              | Backend                                        | Frontend                                               |
|-------------------------------------|------------------------------------------------|--------------------------------------------------------|
| José Luis Carrera García            | Auth Service + App Móvil (Expo / React Native) | Sección de autenticación y acceso                      |
| Benjamín Andrés Ramírez Garrido     | User Service                                   | Sección de perfiles y búsqueda de trabajadores         |
| Naomi Alejandra Villarroel González | Interaction Service                            | Sección de solicitudes, chat y calificaciones          |

---

*Proyecto de Título — Analista Programador Computacional — Duoc UC, Sede San Joaquín*
