package com.worki.auth.controllers;

import com.worki.auth.dto.request.LoginRequest;
import com.worki.auth.dto.request.RecuperarPasswordRequest;
import com.worki.auth.dto.request.RegistroRequest;
import com.worki.auth.dto.request.ResetPasswordRequest;
import com.worki.auth.dto.response.AuthResponse;
import com.worki.auth.dto.response.UsuarioResponse;
import com.worki.auth.services.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// @Tag agrupa los endpoints en Swagger UI bajo el nombre "Autenticación"
@Tag(name = "Autenticación", description = "Registro, login y recuperación de contraseña")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private AuthService authService;

    // @Valid activa las validaciones del DTO - si falla devuelve 400 automáticamente
    @Operation(summary = "Registrar nuevo usuario")
    @PostMapping("/registro")
    public ResponseEntity<UsuarioResponse> registro(@Valid @RequestBody RegistroRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registro(request));
    }

    @Operation(summary = "Iniciar sesión - devuelve JWT")
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // token llega como query param en la URL del link del correo: /verificar-email?token=xxx
    @Operation(summary = "Verificar email con token recibido por correo")
    @GetMapping("/verificar-email")
    public ResponseEntity<Void> verificarEmail(@RequestParam String token) {
        authService.verificarEmail(token);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Solicitar link de recuperación de contraseña")
    @PostMapping("/recuperar-password")
    public ResponseEntity<Void> recuperarPassword(@Valid @RequestBody RecuperarPasswordRequest request) {
        authService.recuperarPassword(request);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Resetear contraseña con token recibido por correo")
    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok().build();
    }
}
