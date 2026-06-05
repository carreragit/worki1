package com.worki.user.perfil;

// Controlador exclusivo para comunicación interna entre microservicios.
// Llamado por auth-service al registrar un usuario para crear su perfil básico automáticamente.
// No está expuesto en el gateway — solo accesible directamente por puerto 8082.

import com.worki.user.perfil.dto.PerfilResponseDTO;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/internal/perfiles")
@RequiredArgsConstructor
public class PerfilInternalController {

    private final PerfilService perfilService;

    // Recibe usuarioId y nombre desde auth-service y crea el perfil básico
    @PostMapping
    public ResponseEntity<Void> crearPerfilBasico(@RequestBody CrearPerfilBasicoRequest request) {
        perfilService.crearPerfilBasico(request.getUsuarioId(), request.getNombreCompleto());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    // Usado por interaction-service para resolver nombres de cliente/trabajador por usuarioId
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<PerfilResponseDTO> obtenerPorUsuarioId(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(perfilService.obtenerPorUsuarioId(usuarioId));
    }

    @Data
    public static class CrearPerfilBasicoRequest {
        private Long usuarioId;
        private String nombreCompleto;
    }
}
