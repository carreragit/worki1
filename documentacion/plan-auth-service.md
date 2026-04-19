# Plan de implementación — Auth Service (Worki)

> Documento de referencia para José. Cubre backend (Spring Boot) y frontend (React web + App Expo) del servicio de autenticación. Arquitectura: **MVC + package-by-layer**, convenciones Spring con Lombok + springdoc-openapi.

---

## Alcance y decisiones previas acordadas

| Tema | Decisión |
|---|---|
| Roles en auth-service | Solo `USUARIO` y `ADMIN`. Cliente/Trabajador es atributo de user-service (depende de tener PerfilOficio activo). |
| Librería JWT | `io.jsonwebtoken:jjwt` 0.12.x |
| Tokens | Solo access token, expiración 24 h (sin refresh token — simplifica el MVP) |
| Referidos | Dentro del MVP. Código único por usuario + tabla de relación. Los beneficios (rebaja/destacar) los aplica otro microservicio. |
| Frontend | Todo el frontend del auth lo hace José: Expo (login nativo + WebView) + páginas web de login/registro. Cada integrante hace back + front de su microservicio. |
| Verificación email + reset password | Dentro del MVP, con `spring-boot-starter-mail` + Mailtrap en dev. |

---

## BLOQUE A — BACKEND (auth-service)

### Arquitectura del paquete

```
com.worki.auth/
├── AuthApplication.java
├── config/
│   ├── SecurityConfig.java       # SecurityFilterChain + BCrypt
│   └── OpenApiConfig.java        # metadatos Swagger
├── usuario/
│   ├── Usuario.java              # @Entity raíz
│   ├── UsuarioRepository.java
│   ├── Rol.java                  # enum USUARIO, ADMIN
│   └── UsuarioMapper.java
├── auth/
│   ├── AuthController.java       # POST /api/auth/login, GET /api/auth/me
│   ├── AuthService.java
│   ├── dto/
│   │   ├── LoginRequest.java
│   │   └── LoginResponse.java
│   └── jwt/
│       └── JwtService.java
├── registro/
│   ├── RegistroController.java   # POST /api/auth/registro
│   ├── RegistroService.java
│   └── dto/
│       ├── RegistroRequest.java
│       └── RegistroResponse.java
├── referido/
│   ├── ReferidoController.java   # /api/auth/referidos/**
│   ├── ReferidoService.java
│   ├── Referido.java
│   └── ReferidoRepository.java
├── email/
│   ├── EmailService.java         # JavaMailSender wrapper
│   ├── VerificacionController.java
│   ├── VerificacionService.java
│   ├── PasswordResetController.java
│   ├── PasswordResetService.java
│   ├── TokenEmail.java           # @Entity
│   ├── TokenEmailRepository.java
│   └── TipoToken.java            # enum VERIFICACION_EMAIL, RESET_PASSWORD
├── internal/
│   ├── UsuarioInternalController.java  # GET /internal/usuarios/{id}
│   └── dto/UsuarioInternalDto.java
└── exception/
    ├── GlobalExceptionHandler.java
    ├── EmailYaRegistradoException.java
    ├── CredencialesInvalidasException.java
    └── TokenInvalidoException.java
```

### Fase 1 — Infraestructura base

**Dependencias (`pom.xml` de auth-service):**

- `io.jsonwebtoken:jjwt-api` (0.12.6)
- `io.jsonwebtoken:jjwt-impl` (runtime)
- `io.jsonwebtoken:jjwt-jackson` (runtime)
- `spring-boot-starter-mail`
- `org.springdoc:springdoc-openapi-starter-webmvc-ui` (2.6.0)

**`application.properties` — añadir:**

```properties
# JWT
jwt.secret=<256-bit-base64>
jwt.expiration-ms=86400000

# URL del frontend (para construir enlaces de email)
app.frontend.url=http://localhost:5173

# Mail (Mailtrap sandbox en dev)
spring.mail.host=sandbox.smtp.mailtrap.io
spring.mail.port=2525
spring.mail.username=<usuario-mailtrap>
spring.mail.password=<password-mailtrap>
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Flag para activar/desactivar bloqueo por email no verificado
app.auth.requerir-email-verificado=false
```

> ⚠️ `jwt.secret` y credenciales de Mailtrap deben ir en `application-local.properties` (añadir al `.gitignore`) o variables de entorno. Nunca commitear.

**`config/SecurityConfig.java`:**

- `SecurityFilterChain` stateless, CSRF off.
- Permite sin auth: `/api/auth/**`, `/internal/**`, `/swagger-ui/**`, `/v3/api-docs/**`.
- Resto: exige header `X-User-Id` (el gateway lo añade tras validar JWT).
- Bean `PasswordEncoder` → `BCryptPasswordEncoder`.

**`config/OpenApiConfig.java`:**

- Bean `OpenAPI` con info del servicio (título, versión, descripción).

**`exception/GlobalExceptionHandler.java`:**

- `@RestControllerAdvice`.
- Mapea `EmailYaRegistradoException` → 409, `CredencialesInvalidasException` → 401, `TokenInvalidoException` → 400, `MethodArgumentNotValidException` → 400, resto → 500.
- Respuesta tipo `ProblemDetail` (RFC 7807).

**Entregable:** servicio levanta en 8081, Swagger UI carga, MySQL crea tablas al arrancar.

---

### Fase 2 — Registro y login (sin verificación email)

**Entidad `usuario/Usuario.java`** — `@Data @Entity @Table(name="usuarios") @NoArgsConstructor @AllArgsConstructor`:

| Campo | Tipo | Anotaciones |
|---|---|---|
| id | Long | `@Id @GeneratedValue(IDENTITY)` |
| email | String | `@Column(nullable=false, unique=true)` |
| password | String | `@Column(nullable=false)` (hash BCrypt) |
| nombre | String | `@Column(nullable=false)` |
| rol | Rol | `@Enumerated(EnumType.STRING)` |
| emailVerificado | boolean | default false |
| codigoReferidoPropio | String | `@Column(unique=true)` — 8 chars alfanuméricos |
| fechaCreacion | LocalDateTime | `@CreationTimestamp` |

**`UsuarioRepository extends JpaRepository<Usuario, Long>`**: `Optional<Usuario> findByEmail`, `boolean existsByEmail`, `Optional<Usuario> findByCodigoReferidoPropio`.

**Registro:**

- `RegistroRequest` — `@NotBlank @Email email`, `@NotBlank @Size(min=8) password`, `@NotBlank nombre`, `String codigoReferidoUsado` (opcional).
- `RegistroService.registrar(dto)`:
  1. Si `existsByEmail` → `EmailYaRegistradoException`.
  2. Hash password con `passwordEncoder.encode`.
  3. Generar `codigoReferidoPropio` único (loop hasta que `findByCodigoReferidoPropio` devuelva vacío).
  4. Guardar usuario.
  5. Si `codigoReferidoUsado` no es null → `referidoService.registrarReferido(codigo, nuevoUsuarioId)` (ver Fase 4).
  6. Disparar `verificacionService.enviarCorreoVerificacion(usuario)` (Fase 3).
- `RegistroController` — `@RestController @RequestMapping("/api/auth") @Tag(name="Registro")` → `POST /registro`.

**Login:**

- `LoginRequest` (email, password con validaciones).
- `LoginResponse` (token, objeto usuario simplificado).
- `jwt/JwtService`:
  - `generarToken(Usuario)` — claims: `sub=userId`, `email`, `rol`, `iat`, `exp` (now + 24h).
  - `validarToken(String)` — valida firma y expiración, devuelve claims.
- `AuthService.login(dto)`: `findByEmail` → `passwordEncoder.matches` → si falla, `CredencialesInvalidasException`. Si `app.auth.requerir-email-verificado=true` y `!emailVerificado` → 403. Genera JWT, arma response.
- `AuthController` → `POST /login`, `GET /me` (lee `X-User-Id`, devuelve datos).

**Entregable:** Postman — registrar, loguear, recibir JWT válido y decodificable en jwt.io.

---

### Fase 3 — Verificación de email y reset de password

**Entidad `email/TokenEmail`:**

| Campo | Tipo |
|---|---|
| id | Long |
| idUsuario | Long |
| token | String (UUID, unique) |
| tipo | TipoToken (VERIFICACION_EMAIL / RESET_PASSWORD) |
| expira | LocalDateTime |
| usado | boolean |

**`EmailService`** — `@Service` con `JavaMailSender` inyectado:

- `enviarVerificacion(usuario, token)` → URL = `${app.frontend.url}/verificar-email?token=${token}`.
- `enviarResetPassword(usuario, token)` → URL = `${app.frontend.url}/reset-password?token=${token}`.
- Usa `SimpleMailMessage` en MVP (HTML queda para después).

**Flujo verificación email:**

1. Al registrar → `VerificacionService.enviarCorreoVerificacion(usuario)` crea `TokenEmail` tipo VERIFICACION (expira en 24h) → `EmailService.enviarVerificacion`.
2. `GET /api/auth/verificar-email?token=xxx` → busca token, valida (no expirado, no usado, tipo correcto) → `usuario.emailVerificado=true` → marca token usado.

**Flujo reset password:**

1. `POST /api/auth/recuperar-password` body `{email}` → si existe: crea token RESET (expira 1h) + envía correo. Respuesta 200 siempre (no filtrar existencia del email).
2. `POST /api/auth/reset-password` body `{token, nuevaPassword}` → valida token → actualiza password (BCrypt) → marca token usado.

**Entregable:** probado contra Mailtrap, correo llega, enlace funciona, flujo completo en Postman.

---

### Fase 4 — Referidos

**Entidad `referido/Referido`:**

| Campo | Tipo |
|---|---|
| id | Long |
| idReferidor | Long |
| idReferido | Long (unique — un usuario solo puede ser referido una vez) |
| fechaCreacion | LocalDateTime |

**`ReferidoService`:**

- `registrarReferido(codigoUsado, idNuevoUsuario)`: `usuarioRepo.findByCodigoReferidoPropio(codigoUsado)` → si existe y `id != idNuevoUsuario` → insertar fila. Si no existe → log warning (no fallar el registro).
- `contarReferidosDe(userId)`: `countByIdReferidor`.
- `listarReferidosDe(userId)`: join con usuario para devolver nombre/email de cada referido.

**Controller** (`@RestController @RequestMapping("/api/auth/referidos") @Tag(name="Referidos")`):

- `GET /mis` (protegido, lee `X-User-Id`) — lista.
- `GET /contador` (protegido) — número.

> La aplicación de beneficios (rebaja en cuota, destacar perfil) **no** va en auth-service. Queda para que user-service o publication-service consuman `/contador` cuando lo necesiten.

**Entregable:** registrar dos cuentas, la segunda con código de la primera, verificar que `/mis` de la primera devuelve a la segunda.

---

### Fase 5 — Endpoints internos para otros microservicios

Siguen la convención `/internal/**` definida en `comunicacion-microservicios.md`.

- `GET /internal/usuarios/{id}` → `UsuarioInternalDto` (id, email, nombre, rol, emailVerificado, codigoReferidoPropio).
- `GET /internal/usuarios/email/{email}` (por si algún servicio tiene email pero no id).

Sin JWT (el gateway solo enruta `/api/**`, estos endpoints no son accesibles desde el exterior).

---

### Fase 6 — Actualización del Gateway

Requerido para que el resto del sistema use el auth:

- `backend/gateway/application.properties`: cambiar paths `/auth/**` → `/api/auth/**`, `/users/**` → `/api/usuarios/**`, `/publications/**` → `/api/publicaciones/**`, `/interactions/**` → `/api/interacciones/**`.
- Implementar `JwtAuthenticationFilter` (GlobalFilter o GatewayFilterFactory):
  - Lista blanca (pasan sin validar JWT):
    - `POST /api/auth/login`
    - `POST /api/auth/registro`
    - `GET  /api/auth/verificar-email`
    - `POST /api/auth/recuperar-password`
    - `POST /api/auth/reset-password`
  - Resto: exige `Authorization: Bearer ...`. Valida firma + expiración con el mismo `jwt.secret` que auth-service. Si OK, inyecta headers `X-User-Id`, `X-User-Email`, `X-User-Role`. Si falla, responde 401.
- `gateway/pom.xml`: añadir `jjwt-*` (mismo grupo y versión).

---

### Fase 7 — Tests y documentación

- JUnit + `@SpringBootTest`:
  - `RegistroServiceTest`: email duplicado lanza excepción, código referido único.
  - `AuthServiceTest`: password incorrecto → 401, JWT válido.
  - `ReferidoServiceTest`: código inexistente no bloquea registro, contador correcto.
- Test de integración del flujo completo: registro → verificar email → login → /me.
- Postman collection con todas las rutas exportada a `documentacion/postman/auth-service.postman_collection.json`.

---

## BLOQUE B — FRONTEND

### B.1 — Frontend web (React + Vite + Tailwind)

**Inicialización** (en `frontend/`, primero borrar `front.txt`):

```bash
npm create vite@latest . -- --template react
npm install react-router-dom axios
npm install -D tailwindcss@latest postcss autoprefixer
npx tailwindcss init -p
```

Configurar `tailwind.config.js`:

```js
content: ["./index.html", "./src/**/*.{js,jsx}"]
```

Y añadir en `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Estructura:**

```
frontend/
├── src/
│   ├── main.jsx
│   ├── App.jsx                     # router principal
│   ├── pages/
│   │   ├── Login/Login.jsx
│   │   ├── Registro/Registro.jsx
│   │   ├── VerificarEmail/VerificarEmail.jsx   # lee ?token=, llama GET /verificar-email
│   │   ├── RecuperarPassword/RecuperarPassword.jsx  # form email
│   │   ├── ResetPassword/ResetPassword.jsx     # lee ?token=, pide nueva pass
│   │   └── Home/Home.jsx           # placeholder post-login (hasta que otros MS existan)
│   ├── components/
│   │   ├── ProtectedRoute.jsx
│   │   └── PublicOnlyRoute.jsx
│   ├── services/
│   │   ├── api.js                  # axios instance baseURL=http://localhost:8080
│   │   └── authService.js          # login, registro, verificar, recuperar, reset, me
│   └── context/
│       └── AuthContext.jsx         # {usuario, token, login, logout, loading}
├── index.html
├── tailwind.config.js
└── vite.config.js
```

**Decisiones:**

- JWT en `localStorage`. Tradeoff aceptado: más fácil, XSS es riesgo. Suficiente para MVP académico.
- Al montar `AuthContext`: si hay token, `GET /api/auth/me` para validar; si 401, limpiar y marcar sin sesión.
- **Detección de `?token=xxx` al arrancar**: si viene en la URL, guardar como sesión y limpiar con `history.replaceState`. Esto cubre el flujo WebView desde Expo.
- Interceptor axios: adjunta `Authorization: Bearer ${token}` si existe. Si recibe 401, limpia sesión y redirige a `/login`.
- **Mobile-first**: diseñar a 360px primero, luego breakpoints `md:`/`lg:`.

**Orden de implementación:**

1. `api.js` + `authService.js` + `AuthContext.jsx` (scaffold sin UI).
2. `Login.jsx` + `Registro.jsx` con Tailwind. Validación con estado local (sin react-hook-form, mantenerlo simple).
3. `ProtectedRoute` + `Home` stub + routing.
4. `VerificarEmail`, `RecuperarPassword`, `ResetPassword`.
5. Logout + manejo de expiración del token.

---

### B.2 — App Expo (login nativo + WebView)

**Inicialización** (carpeta nueva `mobile/` en la raíz del repo):

```bash
npx create-expo-app mobile --template blank
cd mobile
npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context
npm install react-native-webview
npx expo install expo-secure-store
```

**Estructura:**

```
mobile/
├── App.js                          # NavigationContainer + Stack
├── screens/
│   ├── LoginScreen.js              # TextInput email/pass, validaciones nativas
│   ├── RegistroScreen.js           # idem + codigoReferido opcional
│   └── WebViewScreen.js            # <WebView source={{uri: WEB_URL + '?token=' + token}} />
├── services/
│   └── authApi.js                  # fetch a http://<ip-lan>:8080/api/auth/*
├── context/
│   └── AuthContext.js
├── utils/
│   └── validaciones.js             # email regex, Platform.Version check
├── app.json
└── .env (o app.config.js con expo-constants)
```

**Decisiones:**

- JWT en `expo-secure-store` (keychain nativo — más seguro que AsyncStorage).
- URL del gateway:
  - Emulador Android: `http://10.0.2.2:8080`.
  - Dispositivo físico: IP LAN de la PC (ej. `http://192.168.1.100:8080`).
  - Config vía `.env` o `app.config.js` + `expo-constants`.
- **Validaciones del dispositivo** (en `utils/validaciones.js`, el punto que el profesor mencionó):
  - `Platform.Version >= 24` (Android 7.0+) antes de permitir registro.
  - Regex email estándar.
  - Longitud mínima password.
- Al loguear → guarda JWT en SecureStore → `navigation.reset` a `WebView`.
- Logout en `WebViewScreen`: botón overlay o menú → borra SecureStore → vuelve a `Login`.

**Orden de implementación:**

1. Scaffold con navegación y `AuthContext`.
2. `LoginScreen` + `authApi.login`.
3. `RegistroScreen`.
4. `WebViewScreen` con inyección de token vía query param.
5. Validaciones nativas + manejo de errores de red.

---

## Orden global sugerido

1. **Backend Fase 1–2** (infra + registro/login) — piezas mínimas para que Expo y web puedan loguear.
2. **Backend Fase 3** (email/reset) — Naomi puede empezar wireframes en paralelo.
3. **Backend Fase 4** (referidos) + **Fase 5** (internal) en paralelo.
4. **Gateway Fase 6** — desbloquea a Benjamín y Naomi para proteger sus endpoints.
5. **Frontend web (B.1)**.
6. **App Expo (B.2)**.

---

## Dudas abiertas por resolver

- **`jwt.secret` y credenciales de correo**: definir si van en `application-local.properties` (añadir a `.gitignore`) o variables de entorno. Recomiendo el primero: spring lo resuelve sin librerías extra.
- **Política de email verificado**: ¿bloquear login si `!emailVerificado` desde el día 1, o solo marcarlo y activar el bloqueo cuando esté todo probado? Recomiendo flag `app.auth.requerir-email-verificado` en properties (ya incluido en Fase 1).
- **Primer admin**: ¿crear por INSERT manual en BD, o `CommandLineRunner` que lo siembre si no existe ningún usuario con rol ADMIN?
- **CORS**: el gateway necesita configurar CORS para aceptar requests de `http://localhost:5173` (web) y del WebView de Expo. Definir dónde va la config (gateway `CorsConfig.java` según `estructura.txt`).

---

## Convenciones recordatorio

- Controllers: `@RestController`, `@RequestMapping("/api/<feature>")`, `@Tag`, `@Operation` en cada método, `@Autowired` para deps, `@Valid` en `@RequestBody`.
- Entidades: `@Data`, `@Entity`, `@Table`, `@NoArgsConstructor`, `@AllArgsConstructor`, `@Enumerated(EnumType.STRING)` para enums.
- DTOs separados para Request y Response, con `@NotBlank`, `@Email`, `@Size`, etc.
- Services con `@Service` y `@Transactional` en métodos que modifican estado.
- Repositories extienden `JpaRepository<Entidad, Long>`; query methods antes que `@Query`.
- Mappers con `@Component` y nombre `XxxMapper`.
