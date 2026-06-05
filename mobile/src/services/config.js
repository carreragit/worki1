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
 * GATEWAY_URL: IP y puerto del gateway (8080). Todas las llamadas HTTP pasan por aquí.
 * WS_URL:      IP y puerto del interaction-service (8084) para el WebSocket del chat.
 *              El WebSocket va directo al interaction-service porque el gateway
 *              no proxea conexiones WebSocket.
 */
export const GATEWAY_URL = 'http://192.168.1.102:8080';
export const WS_URL      = 'ws://192.168.1.102:8084';
