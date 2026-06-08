package com.worki.user.perfil;

// Controlador exclusivo para comunicación interna entre microservicios.
// Llamado por auth-service al registrar un usuario para crear su perfil básico automáticamente.
// No está expuesto en el gateway — solo accesible directamente por puerto 8082.

import com.worki.user.perfil.dto.PerfilResponseDTO;
import com.worki.user.trabajador.TrabajadorRepository;
import jakarta.persistence.EntityNotFoundException;
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
    private final TrabajadorRepository trabajadorRepository;

    // Recibe usuarioId y nombre desde auth-service y crea el perfil básico
    @PostMapping
    public ResponseEntity<Void> crearPerfilBasico(@RequestBody CrearPerfilBasicoRequest request) {
        perfilService.crearPerfilBasico(request.getUsuarioId(), request.getNombreCompleto());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    // Usado por interaction-service para resolver el nombre del cliente por usuarioId
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<PerfilResponseDTO> obtenerPorUsuarioId(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(perfilService.obtenerPorUsuarioId(usuarioId));
    }

    // Usado por interaction-service para resolver el nombre del trabajador por trabajadorId.
    // trabajadorId != usuarioId: primero resuelve el perfilId desde la tabla trabajadores,
    // luego obtiene el perfil directamente por su id.
    @GetMapping("/trabajador/{trabajadorId}")
    public ResponseEntity<PerfilResponseDTO> obtenerPorTrabajadorId(@PathVariable Long trabajadorId) {
        Long perfilId = trabajadorRepository.findById(trabajadorId)
                .orElseThrow(() -> new EntityNotFoundException("Trabajador no encontrado: " + trabajadorId))
                .getPerfilId();
        return ResponseEntity.ok(perfilService.obtenerPorId(perfilId));
    }

    @Data
    public static class CrearPerfilBasicoRequest {
        private Long usuarioId;
        private String nombreCompleto;
    }
}
