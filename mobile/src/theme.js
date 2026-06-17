// Tema global de la app. Importa desde aquí colores, gradientes, radios y sombras
// en lugar de escribir valores fijos en cada pantalla. Si el diseño cambia,
// basta con modificar este archivo para que el cambio se refleje en toda la app.

export const COLORS = {
  // ── Marca y acciones principales ──
  primary:      '#16A34A',  // verde Worki — botones, acentos, elementos activos
  primaryDark:  '#15803D',  // verde más oscuro — usado en gradientes
  primaryLight: '#DCFCE7',  // verde claro — fondos de badges y chips
  primarySoft:  '#F0FDF4',  // verde muy suave — fondos de tarjetas resaltadas
  primaryBorder:'#BBF7D0',  // borde verde claro

  // ── Superficies y fondos ──
  background:   '#F9FAFB',  // fondo general de pantallas
  surface:      '#FFFFFF',  // fondo de tarjetas, headers, inputs
  surfaceAlt:   '#F3F4F6',  // fondo gris alternativo (chat, estados cancelados)

  // ── Texto ──
  textPrimary:  '#111827',  // texto principal
  textSecondary:'#6B7280',  // texto secundario
  textMuted:    '#9CA3AF',  // texto deshabilitado / placeholders
  textLight:    '#374151',  // texto de párrafos
  disabled:     '#D1D5DB',  // gris de elementos inactivos (estrellas, botones deshabilitados, íconos vacíos)

  // ── Bordes ──
  border:       '#E5E7EB',  // borde estándar
  borderLight:  '#F3F4F6',  // borde muy sutil

  // ── Estados / feedback ──
  error:        '#DC2626',
  errorBg:      '#FEF2F2',
  errorBorder:  '#FECACA',
  success:      '#16A34A',
  warning:      '#FBBF24',

  // ── Color secundario (chat) ──
  info:         '#2563EB',  // azul — indicadores y botón de chat
  infoBg:       '#EFF6FF',
  infoBorder:   '#BFDBFE',
};

// Colores rotativos para los avatares de los trabajadores.
// Se elige uno según el id del trabajador para que cada uno tenga un color consistente.
export const AVATAR_COLORS = ['#16A34A', '#2563EB', '#9333EA', '#EA580C', '#0891B2', '#DC2626'];

// Colores de fondo y texto para cada estado de una solicitud.
// Se usan en las tarjetas y en el detalle para dar feedback visual del estado.
export const ESTADO_COLORS = {
  PENDIENTE:  { bg: '#FEF3C7', text: '#92400E' },
  ACEPTADA:   { bg: '#DCFCE7', text: '#166534' },
  EN_PROCESO: { bg: '#EDE9FE', text: '#5B21B6' },
  COMPLETADA: { bg: '#F0F9FF', text: '#0369A1' },
  RECHAZADA:  { bg: '#FEE2E2', text: '#991B1B' },
  CANCELADA:  { bg: '#F3F4F6', text: '#6B7280' },
};

// Colores para el botón y badge de calificación (estrellas)
export const RATING_COLORS = {
  star:    '#FBBF24',  // amarillo de las estrellas
  bg:      '#FFFBEB',  // fondo del botón "Dejar reseña"
  border:  '#FDE68A',
  text:    '#92400E',
};

export const GRADIENTS = {
  header: ['#41836c', '#70eacb', '#4ADE80'],
};

export const RADII = {
  sm:   8,
  md:   14,
  lg:   16,
  xl:   20,
  full: 28,
};

export const SHADOWS = {
  card: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius:  4,
    elevation:     2,
  },
  boton: {
    shadowColor:   '#16A34A',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius:  8,
    elevation:     4,
  },
  buscador: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius:  6,
    elevation:     4,
  },
};
