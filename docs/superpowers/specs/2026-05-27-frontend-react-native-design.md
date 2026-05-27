


# Worki — Frontend React Native (Estilo "Worki Soft")
> Spec de diseño aprobado · 2026-05-27

---

## Resumen

Reemplazar la pantalla `WebViewScreen` del app móvil Expo por pantallas nativas React Native.
El código vive dentro de `mobile/` — no se crea un proyecto nuevo.
Primera versión incluye: **Home** y **Solicitudes**, más placeholders para Explorar y Perfil.

---

## 1. Arquitectura y estructura de archivos

```
mobile/
├── App.js                            ← modificar: Login → MainTabNavigator post-login
├── src/
│   ├── screens/
│   │   ├── LoginScreen.js            ← sin cambios
│   │   ├── RegisterScreen.js         ← sin cambios
│   │   ├── HomeScreen.js             ← NUEVO
│   │   ├── SolicitudesScreen.js      ← NUEVO
│   │   └── PlaceholderScreen.js      ← NUEVO (Explorar + Perfil)
│   ├── components/
│   │   ├── WorkerCard.js             ← NUEVO: card reutilizable de trabajador
│   │   ├── CategoryChip.js           ← NUEVO: chip de categoría seleccionable
│   │   └── SolicitudCard.js          ← NUEVO: card de solicitud con badge de estado
│   ├── services/
│   │   ├── authService.js            ← sin cambios
│   │   ├── trabajadoresService.js    ← NUEVO: GET /api/publicaciones/buscar
│   │   └── solicitudesService.js     ← NUEVO: GET /api/interacciones/solicitudes/cliente/{id}
│   ├── navigation/
│   │   └── MainTabNavigator.js       ← NUEVO: bottom tabs con 4 tabs
│   └── theme/
│       └── colors.js                 ← NUEVO: paleta de colores centralizada
```

**Cambio en `App.js`:** el Stack Navigator agrega `Main` (MainTabNavigator) y elimina `WebView`.
Post-login navega a `Main` en lugar de `WebView`.

---

## 2. Navegación

### Stack raíz

```
Stack Navigator
├── Login          (ya existe)
├── Registro       (ya existe)
└── Main           → MainTabNavigator (reemplaza WebView)
```

### Tab Navigator (MainTabNavigator)

```
Bottom Tab Navigator
├── Inicio         🏠  → HomeScreen
├── Explorar       🔍  → PlaceholderScreen
├── Solicitudes    📋  → SolicitudesScreen
└── Perfil         👤  → PlaceholderScreen
```

**Estilo del tab bar:**
- Fondo blanco, borde superior `#E5E7EB`
- Íconos inactivos: gris `#6B7280`
- Ícono activo: verde `#16A34A` + pill redondeada debajo
- Sin etiquetas en negrita, texto pequeño debajo del ícono
- Librería: `@react-navigation/bottom-tabs`

---

## 3. Home Screen (`HomeScreen.js`)

### Layout

```
┌─────────────────────────────────────────┐
│  HEADER con gradiente #DCFCE7 → #FFFFFF │
│  📍 Peñalolen, Santiago      [WK]       │
│                                         │
│  ╭─────────────────────────────────╮   │
│  │ 🔍  Buscar gasfiter, elec...    │   │
│  ╰─────────────────────────────────╯   │
│                                         │
│  CATEGORÍAS (ScrollView horizontal)     │
│  ╭──────╮ ╭──────╮ ╭──────╮ ...        │
│  │  ⚡  │ │  🔧  │ │  🔑  │            │
│  │Elect.│ │Gasf. │ │Cerr. │            │
│  ╰──────╯ ╰──────╯ ╰──────╯            │
│                                         │
│  TRABAJADORES DESTACADOS  Ver todos →   │
│  ╭──────────────────────────────────╮  │
│  │ WorkerCard                       │  │
│  ╰──────────────────────────────────╯  │
│  ╭──────────────────────────────────╮  │
│  │ WorkerCard                       │  │
│  ╰──────────────────────────────────╯  │
└─────────────────────────────────────────┘
```

### Comportamiento

- **Header:** `LinearGradient` o `View` con fondo `#DCFCE7`, altura ~120px con safe area
- **Ubicación:** texto estático "Tu ubicación" + "Peñalolen, Santiago" (sin geolocalización real por ahora)
- **Avatar usuario:** círculo verde con iniciales del nombre del usuario logueado
- **Searchbar:** solo visual; al tocar navega al tab Explorar (que está vacío por ahora)
- **Categorías hardcodeadas:**
  - ⚡ Electricista, 🔧 Gasfiter, 🔑 Cerrajero, 🛡️ Cuidador, 🎨 Pintor, 🪠 Plomero
  - `ScrollView` horizontal, sin paginación
  - Chip activo: fondo `#16A34A` + texto blanco; inactivo: fondo `#F3F4F6` + texto `#374151`
- **Workers:** `FlatList` con `trabajadoresService.getDestacados(oficio)`
  - Si el endpoint falla → datos mock automáticamente (5 trabajadores falsos)
  - Al cambiar categoría → recarga la lista

### WorkerCard (`components/WorkerCard.js`)

- Avatar: círculo con iniciales, color de fondo generado a partir del nombre (hash → color pastel)
- Nombre + oficio
- Estrellas (★) calculadas del rating, número de reviews entre paréntesis
- 📍 Ubicación + rango de precio a la derecha
- Sombra suave, borde redondeado 12px, padding 12px

---

## 4. Solicitudes Screen (`SolicitudesScreen.js`)

### Layout

```
┌─────────────────────────────────────────┐
│  HEADER gradiente igual que Home        │
│  "Mis Solicitudes"                      │
│                                         │
│  FILTROS (ScrollView horizontal pills)  │
│  [Todas] [Pendientes] [Activas] [Listas]│
│                                         │
│  FlatList de SolicitudCard              │
│  ╭──────────────────────────────────╮  │
│  │ Electricista            🟡 PEND. │  │
│  │ "Reparar enchufe cocina"         │  │
│  │ 📅 hace 2 días                   │  │
│  ╰──────────────────────────────────╯  │
│                                         │
│  [Estado vacío si lista está vacía]     │
└─────────────────────────────────────────┘
```

### Comportamiento

- **Filtros:** Todas / Pendientes / Activas (ACEPTADA) / Completadas
- **API:** `GET /api/interacciones/solicitudes/cliente/{clienteId}` (a través del Gateway :8080)
  - `clienteId` extraído del JWT decodificado (campo `sub`)
- **SolicitudCard:** descripción truncada a 1 línea, fecha relativa, badge de estado
- **Estado vacío:** ícono + "Aún no tienes solicitudes"

### Colores de estado

| Estado      | Color     | Hex       |
|-------------|-----------|-----------|
| PENDIENTE   | Amarillo  | `#F59E0B` |
| ACEPTADA    | Verde     | `#16A34A` |
| COMPLETADA  | Gris      | `#6B7280` |
| RECHAZADA   | Rojo      | `#EF4444` |
| CANCELADA   | Gris osc. | `#374151` |

---

## 5. Capa de datos

### `trabajadoresService.js`

```
getDestacados(oficio?: string) →
  GET /api/publicaciones/buscar?oficio={oficio}&radio=5
  Headers: Authorization: Bearer {token}
  Fallback: mock data si el endpoint no responde
```

### `solicitudesService.js`

```
getMisSolicitudes(clienteId: number) →
  GET /api/interacciones/solicitudes/cliente/{clienteId}  (a través del Gateway :8080)
  Headers: Authorization: Bearer {token}
```

### Patrón compartido

- `axios` con `baseURL = GATEWAY_URL` (igual que `authService.js`)
- JWT obtenido de `SecureStore` en cada llamada
- Error 401 → `navigation.replace('Login')`
- Error de red → estado de error en pantalla (sin crash)

### Nueva dependencia

- `jwt-decode` — extrae `userId` del payload JWT sin llamar al backend

---

## 6. Sistema de estilos (`theme/colors.js`)

```js
export const colors = {
  primary:        '#16A34A',
  primaryLight:   '#DCFCE7',
  primaryMid:     '#4ADE80',
  text:           '#111827',
  textSecondary:  '#6B7280',
  border:         '#E5E7EB',
  background:     '#FFFFFF',
  card:           '#FFFFFF',
  statusPending:  '#F59E0B',
  statusAccepted: '#16A34A',
  statusDone:     '#6B7280',
  statusRejected: '#EF4444',
  statusCanceled: '#374151',
};
```

- **Tipografía:** fuentes del sistema (SF Pro / Roboto) — sin dependencias externas
- **Sombras:** `elevation: 2` + `shadowOffset/Opacity` en un objeto reutilizable
- **Sin librerías de UI externas:** todo con `StyleSheet` nativo de React Native

---

## 7. Dependencias nuevas

| Paquete | Versión | Uso |
|---|---|---|
| `@react-navigation/bottom-tabs` | compatible con v7 | Tab navigator |
| `jwt-decode` | ^4.x | Extraer userId del JWT |

---

## 8. Lo que queda fuera de esta versión

- Geolocalización real (ubicación hardcodeada por ahora)
- Pantalla Explorar (placeholder)
- Pantalla Perfil (placeholder)
- Detalle de trabajador / contratar
- Detalle de solicitud
- Push notifications