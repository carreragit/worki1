package com.worki.auth.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

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

    // Captura cualquier excepción no manejada arriba - último recurso
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneral(Exception e) {
        // 500: no se expone el mensaje real para no filtrar detalles internos al cliente
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Error interno del servidor"));
    }
}
