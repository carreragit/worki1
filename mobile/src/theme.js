// Tema global de la app. Importa desde aquí colores, gradientes, radios y sombras
// en lugar de escribir valores fijos en cada pantalla. Si el diseño cambia,
// basta con modificar este archivo para que el cambio se refleje en toda la app.

export const COLORS = {
  primary:      '#16A34A',
  primaryLight: '#DCFCE7',
  background:   '#F9FAFB',
  surface:      '#FFFFFF',
  textPrimary:  '#111827',
  textSecondary:'#6B7280',
  textMuted:    '#9CA3AF',
  border:       '#E5E7EB',
  error:        '#DC2626',
  success:      '#16A34A',
  warning:      '#FBBF24',
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
