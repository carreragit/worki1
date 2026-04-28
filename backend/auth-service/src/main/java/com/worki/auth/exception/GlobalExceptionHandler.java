package com.worki.auth.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;
import java.util.stream.Collectors;

// @RestControllerAdvice le dice a Spring que esta clase intercepta excepciones lanzadas
// en cualquier controller de la aplicación, no hay que importarla ni referenciarla en ningún lado
@RestControllerAdvice
public class GlobalExceptionHandler {

    // @ExceptionHandler indica qué tipo de excepción captura este método
    // Spring lo llama automáticamente cuando el service lanza UsuarioNoEncontradoException
    @ExceptionHandler(UsuarioNoEncontradoException.class)
    public ResponseEntity<Map<String, String>> handleUsuarioNoEncontrado(UsuarioNoEncontradoException e) {
        // 404: el recurso solicitado no existe
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
    }

    // Captura el intento de registrar un email que ya existe en la BD
    @ExceptionHandler(EmailYaRegistradoException.class)
    public ResponseEntity<Map<String, String>> handleEmailYaRegistrado(EmailYaRegistradoException e) {
        // 409: conflicto con el estado actual del recurso
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
    }

    // Captura tokens expirados, mal formados o con firma inválida
    @ExceptionHandler(TokenInvalidoException.class)
    public ResponseEntity<Map<String, String>> handleTokenInvalido(TokenInvalidoException e) {
        // 401: no autenticado
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
    }

    // Captura login con email o password incorrectos
    @ExceptionHandler(CredencialesInvalidasException.class)
    public ResponseEntity<Map<String, String>> handleCredencialesInvalidas(CredencialesInvalidasException e) {
        // 401: no autenticado - mensaje genérico para no revelar si el email existe o no
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
    }

    // Captura errores de validacion de DTOs - @NotBlank, @Email, @Size, @Pattern, etc.
    // Spring lanza esta excepcion automaticamente cuando @Valid falla en el controller
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidacion(MethodArgumentNotValidException e) {
        // recolecta todos los mensajes de error de cada campo que falló
        String errores = e.getBindingResult().getFieldErrors().stream()
            .map(field -> field.getField() + ": " + field.getDefaultMessage())
            .collect(Collectors.joining(", "));
        // 400: la request tiene datos invalidos
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", errores));
    }

    // Captura login de usuario que aún no verificó su email
    @ExceptionHandler(EmailNoVerificadoException.class)
    public ResponseEntity<Map<String, String>> handleEmailNoVerificado(EmailNoVerificadoException e) {
        // 403: autenticado pero sin permiso hasta verificar email
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
    }

}
