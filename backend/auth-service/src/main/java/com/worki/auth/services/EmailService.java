package com.worki.auth.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Servicio encargado de enviar correos electrónicos usando la API de Resend.
 * Resend es un servicio externo: en lugar de configurar un servidor de correo propio,
 * le enviamos una petición HTTP con el contenido del mail y ellos lo despachan.
 *
 * Si la API key no está configurada (ej. en modo test), el enlace se imprime
 * en consola como fallback para no romper el flujo.
 */
@Service
public class EmailService {

    // Lee la clave de API de Resend desde application-local.properties.
    // El ":}" al final es un valor por defecto vacío: si la propiedad no existe,
    // resendApiKey queda como "" en lugar de lanzar un error al arrancar.
    @Value("${resend.api.key:}")
    private String resendApiKey;

    // RestTemplate es la clase de Spring para hacer peticiones HTTP desde el backend.
    // La usamos para llamar a la API de Resend (POST https://api.resend.com/emails).
    private final RestTemplate restTemplate = new RestTemplate();

    // Remitente que verán los destinatarios en su bandeja de entrada.
    // Formato: "Nombre visible <dirección@dominio>"
    private static final String FROM = "Worki <noreply@necesitoworki.com>";

    // URL del endpoint de Resend que recibe los mails a enviar.
    private static final String RESEND_URL = "https://api.resend.com/emails";

    /**
     * Envía el correo de verificación de cuenta al usuario recién registrado.
     *
     * @param email Email del destinatario
     * @param token Token único generado al registrarse (se guarda en la BD)
     */
    public void enviarVerificacionEmail(String email, String token) {
        // Construye el enlace completo que el usuario debe abrir para verificar su cuenta.
        // GATEWAY_URL viene de una variable de entorno; si no existe, usa localhost por defecto.
        String link = System.getenv().getOrDefault("GATEWAY_URL", "http://localhost:8080")
                + "/api/auth/verificar-email?token=" + token;

        // Si no hay API key configurada, imprime el enlace en consola y sale.
        // Esto permite probar el registro sin necesidad de recibir un mail real.
        if (resendApiKey.isEmpty()) {
            System.out.println("[EMAIL] Verificación para " + email + ": " + link);
            return;
        }

        // Llama al método privado que hace la petición HTTP a Resend.
        enviar(email,
                "Verifica tu cuenta de Worki",
                "<p>Hola, gracias por registrarte en <strong>Worki</strong>.</p>" +
                "<p>Haz clic en el siguiente enlace para verificar tu cuenta:</p>" +
                "<p><a href=\"" + link + "\">Verificar cuenta</a></p>" +
                "<p>El enlace expira en 24 horas.</p>");
    }

    /**
     * Envía el correo de recuperación de contraseña.
     *
     * @param email Email del destinatario
     * @param token Token único de recuperación (expira en 1 hora)
     */
    public void enviarRecuperacionPassword(String email, String token) {
        // Mismo patrón: construye el enlace con el token de reset.
        String link = System.getenv().getOrDefault("GATEWAY_URL", "http://localhost:8080")
                + "/api/auth/reset-password?token=" + token;

        // Fallback a consola si no hay API key.
        if (resendApiKey.isEmpty()) {
            System.out.println("[EMAIL] Recuperación de contraseña para " + email + ": " + link);
            return;
        }

        enviar(email,
                "Recuperación de contraseña - Worki",
                "<p>Recibimos una solicitud para restablecer tu contraseña de <strong>Worki</strong>.</p>" +
                "<p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>" +
                "<p><a href=\"" + link + "\">Restablecer contraseña</a></p>" +
                "<p>El enlace expira en 1 hora. Si no solicitaste esto, ignora este mensaje.</p>");
    }

    /**
     * Método interno que arma y ejecuta la petición HTTP a la API de Resend.
     *
     * @param to      Email del destinatario
     * @param subject Asunto del correo
     * @param html    Cuerpo del correo en formato HTML
     */
    private void enviar(String to, String subject, String html) {
        // Encabezados HTTP: le indicamos que enviamos JSON y autenticamos con la API key.
        // Resend usa autenticación tipo Bearer: "Authorization: Bearer re_xxxxx"
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(resendApiKey);

        // Cuerpo de la petición: es el JSON que Resend espera recibir.
        // "to" es una lista porque Resend soporta enviar a múltiples destinatarios.
        Map<String, Object> body = Map.of(
            "from", FROM,
            "to", List.of(to),
            "subject", subject,
            "html", html
        );

        // Ejecuta el POST a Resend con los encabezados y el cuerpo armados arriba.
        // String.class le indica que esperamos una respuesta en formato texto (el ID del mail enviado).
        restTemplate.exchange(RESEND_URL, HttpMethod.POST, new HttpEntity<>(body, headers), String.class);
    }
}
