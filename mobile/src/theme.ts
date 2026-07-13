// Paleta y tokens de diseño de RutaSegura.
// Estilo "Blanco Uber": fondo claro, texto tinta, AZUL vivo solo en acciones.
// (El modo oscuro "Grafito" se agregará como paso 2.)
export const colors = {
  // Fondos claros (nombres heredados de la etapa oscura; ahora = claros)
  navy: '#F6F8FB',       // fondo de pantalla (Login / Rutas)
  navyCard: '#FFFFFF',   // tarjetas y campos
  navyCardAlt: '#F0F4FA',
  navyBorder: '#E4E9F1', // líneas / bordes suaves

  // Fondos claros (Mapa / Reportes)
  lightBg: '#F6F8FB',
  white: '#FFFFFF',

  // Color principal (botones, tabs activos, marca) — azul vivo del logo
  primary: '#1C6EF2',
  primaryLight: '#5E97F6',

  // Acento (Ecuador) — realces puntuales
  yellow: '#F5B927',

  // Texto (ahora sobre fondo claro): 'light' = texto principal tinta, muted = gris
  textLight: '#101828',
  textMutedLight: '#5B6472',
  textDark: '#101828',
  textMutedDark: '#5B6472',

  // Semánticos
  green: '#16A34A',
  greenSoft: '#C7EAD4',
  red: '#EF4444',
  redSoft: '#FADCDC',
  orange: '#D97B29',
  orangeSoft: '#F6E0C8',
  purple: '#7C5CFC',
  blue: '#2680EB',

  border: '#E2E8F0',
};

export const radius = { sm: 10, md: 14, lg: 20, xl: 26 };
export const spacing = { xs: 6, sm: 10, md: 16, lg: 22, xl: 30 };
