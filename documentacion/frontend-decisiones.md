# Decisiones de Frontend — Worki

## Arquitectura general — un solo frontend multiplataforma

Worki tiene **un único frontend**: una app construida con **Expo + React Native** que,
gracias a **React Native Web**, corre desde la misma base de código en tres destinos:

```
mobile/  (una sola base de código en JavaScript/JSX)
    │
    ├── Android  (APK nativa vía Expo)
    ├── iOS      (vía Expo)
    └── Web      (React Native Web — mismo código que móvil)
```

No hay un frontend web separado ni un WebView que cargue otra aplicación: las mismas
pantallas (`screens/`) y servicios (`services/`) se reutilizan tal cual en móvil y en web.

---

## Por qué se descartó el plan inicial

La planificación original contemplaba **dos frontends en paralelo**:

1. Una app Expo que solo manejaba el **login nativo**.
2. Un **frontend web independiente** (React + Vite + Tailwind) que se cargaba dentro de
   la app mediante `react-native-webview` para todo el contenido post-login.

Ese enfoque se **abandonó** por las siguientes razones:

- **Mantener dos frontends duplicaba el esfuerzo**: cada pantalla y cada llamada al
  backend habría que construirla y mantenerla dos veces.
- **El WebView agregaba complejidad innecesaria**: paso de JWT entre la capa nativa y la
  web, sincronización de sesión, y una experiencia inconsistente entre ambas capas.
- **React Native Web cubre el caso web** sin código adicional: con una sola base se
  obtiene móvil y web, que es justo lo que el proyecto necesita.

La decisión quedó registrada también al eliminar el directorio `frontend/` (el prototipo
web React/Vite que nunca se integró): *"para no tener que desarrollar 2 frontend de forma
paralela"*.

---

## Stack

| Componente | Tecnología |
|---|---|
| Framework | Expo (SDK 54) + React Native |
| Web | React Native Web (mismo código que móvil) |
| Lenguaje | JavaScript (JSX), no TypeScript |
| Navegación | React Navigation — bottom tabs + stack screens |
| Estado global | Context API (`UserContext`) |
| Almacenamiento de JWT | `expo-secure-store` |
| Llamadas HTTP | `fetch` contra el Gateway |
| Chat en tiempo real | WebSocket (STOMP) directo a interaction-service |

### Decisiones clave

- **Una sola base de código** (Expo + React Native Web) en lugar de dos frontends: evita
  duplicación y mantiene móvil y web siempre sincronizados.
- **JSX sobre TSX**: para el alcance del proyecto, TypeScript agregaba complejidad sin
  beneficio suficiente en una v1.
- **Context API sobre Redux**: el estado global es acotado (usuario autenticado + JWT),
  no justifica la verbosidad de Redux.
- **`expo-secure-store` para el JWT**: almacenamiento seguro del token en el dispositivo,
  en lugar de guardarlo en almacenamiento plano.
- **Un único punto de configuración** de URLs del backend en `src/services/config.js`
  (`GATEWAY_URL` y `WS_URL`): al cambiar de red o pasar a producción solo se toca ese
  archivo.

---

## Comunicación con el backend

- Todo el tráfico HTTP pasa por el **Gateway** (puerto 8080), que es el único punto de
  entrada público y donde se valida el JWT.
- **Excepción — chat**: el Gateway no hace proxy de WebSocket. La app se conecta
  **directamente** a interaction-service (puerto 8084) para el chat en tiempo real, vía
  STOMP. La URL está en `config.js` (`WS_URL`).

---

## Navegación y estado

- **Navegación**: tabs inferiores (Inicio / Solicitudes / Perfil) con
  `@react-navigation/bottom-tabs`; las pantallas de detalle (chat, detalle de solicitud,
  etc.) se apilan encima como stack screens.
- **Estado**: `UserContext` mantiene `userId`, `perfilId`, `nombreCompleto`,
  `esTrabajador` y `trabajadorId`. Se llama a `initUser()` tras el login y a `clearUser()`
  al cerrar sesión.

---

## Responsabilidades

| Integrante | Responsabilidad |
|---|---|
| **José Carrera** | auth-service (Spring Boot) + frontend (app Expo / React Native Web) + infraestructura y despliegue en la nube (backend y frontend) |
| **Naomi Villarroel** | interaction-service (Spring Boot) + frontend (app Expo / React Native Web) |
| **Benjamín Ramírez** | user-service (Spring Boot) |

> El frontend dejó de ser responsabilidad de una sola persona: al unificarse en una sola
> base de código, su desarrollo es compartido por el equipo.
