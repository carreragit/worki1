# Decisiones de Frontend — Worki

## Arquitectura general

La app tiene dos partes diferenciadas:

1. **App Nativa** (Expo) — login y contenedor WebView
2. **Frontend Web** (React) — todo el contenido post-login, responsivo

```
App Expo (login nativo)
    ↓ genera JWT
react-native-webview
    ↓ carga URL del frontend web con JWT
React + Vite + Tailwind (responsive)
    ├── versión móvil (cuando llega desde WebView)
    └── versión escritorio (cuando entra directo desde browser)
```

---

## App Nativa — José

| Componente | Tecnología |
|---|---|
| Framework | Expo + React Native |
| Pantalla de login | React Native nativo |
| Post-login | react-native-webview |
| Lenguaje | JavaScript (JSX) |

### Decisiones clave
- El login es **nativo**, no WebView
- Después del login se abre un WebView interno que carga el frontend web
- Una sola BD (MySQL) en el auth-service, no hay BD espejo
- La app se conecta al auth-service via HTTP (misma red WiFi en desarrollo, servidor real en producción)

---

## Frontend Web — Naomi

| Componente | Tecnología |
|---|---|
| Framework | React + Vite |
| Estilos | Tailwind CSS |
| Lenguaje | JavaScript (JSX) |
| Routing | React Router |
| HTTP calls | Axios |
| Estado global | Context API (AuthContext) |

### Decisiones clave
- **Mobile-first**: el diseño se piensa primero para móvil y se adapta a escritorio
- **JSX** sobre TSX: Tailwind maneja estilos, TypeScript agrega complejidad innecesaria para v1
- **Vite** sobre Next.js o Remix: es una SPA pura, el SSR no aporta valor dentro de un WebView
- **Tailwind** sobre Bootstrap o Material UI: permite diseño original sin componentes genéricos
- **Context API** sobre Redux: el estado global es simple (usuario + JWT), no justifica Redux

---

## Flujo móvil
1. Usuario abre app Expo → ve pantalla de login nativa
2. Ingresa credenciales → app llama al auth-service
3. auth-service valida y devuelve JWT
4. App abre WebView con el JWT
5. Frontend React recibe JWT → abre sesión → muestra versión móvil

## Flujo web
1. Usuario entra directo a la URL del frontend React
2. No trae JWT → redirige a /login web
3. Se loguea contra auth-service → recibe JWT
4. Redirige al index → muestra versión escritorio

---

## Responsabilidades

| Integrante | Responsabilidad |
|---|---|
| **José** | auth-service (Spring Boot) + App Expo (login nativo + WebView) |
| **Naomi** | Frontend React web responsivo (todo post-login) |
| **Benjamín** | user-service + interaction-service (Spring Boot) |
