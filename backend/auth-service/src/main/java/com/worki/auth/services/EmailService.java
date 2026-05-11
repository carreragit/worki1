package com.worki.auth.services;

import org.springframework.stereotype.Service;

// En desarrollo no se envía correo real - el link se imprime en consola
@Service
public class EmailService {

    public void enviarVerificacionEmail(String email, String token) {
        String link = "http://localhost:8080/api/auth/verificar-email?token=" + token;
        System.out.println("[EMAIL] Verificación para " + email + ": " + link);
    }

    public void enviarRecuperacionPassword(String email, String token) {
        String link = "http://localhost:8080/api/auth/reset-password?token=" + token;
        System.out.println("[EMAIL] Recuperación de password para " + email + ": " + link);
    }
}
