/**
 * config.js — punto único de configuración de URLs del backend.
 *
 * IMPORTANTE: Este es el único archivo que hay que tocar cuando cambia la IP
 * del servidor. Todos los servicios y pantallas importan desde aquí.
 *
 * Cuándo cambiar estas URLs:
 *   - Cambiaste de red WiFi y tu PC tiene una IP distinta
 *   - Otro integrante del equipo levanta el backend en su máquina
 *   - Se despliega el backend en la nube (reemplazar por IP pública o dominio)
 *
 * GATEWAY_URL: dirección del servidor. Todas las llamadas de la app pasan por aquí.
 * WS_URL:      dirección para el chat en tiempo real.
 */
// URLs de producción para el APK. Apuntan al servidor en la nube.
export const GATEWAY_URL = process.env.EXPO_PUBLIC_GATEWAY_URL ?? 'https://api.necesitoworki.com';
export const WS_URL      = process.env.EXPO_PUBLIC_WS_URL      ?? 'wss://ws.necesitoworki.com';
