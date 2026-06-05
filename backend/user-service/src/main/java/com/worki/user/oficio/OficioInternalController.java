package com.worki.user.oficio;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Controlador exclusivo para comunicación interna entre microservicios.
// Llamado por interaction-service tras cada calificación registrada.
// No está expuesto en el gateway — solo accesible directamente por puerto 8082.
@RestController
@RequestMapping("/internal/oficios")
@RequiredArgsConstructor
public class OficioInternalController {

    private final OficioService oficioService;

    // PATCH /internal/oficios/{id}/promedio
    // interaction-service llama este endpoint cada vez que se registra una calificación
    // para mantener el promedio del oficio sincronizado sin tener que consultarlo cada vez
    @PatchMapping("/{id}/promedio")
    public ResponseEntity<Void> actualizarPromedio(
            @PathVariable Long id,
            @RequestBody ActualizarPromedioRequest request) {
        oficioService.actualizarPromedio(id, request.getPromedio(), request.getTotalCalificaciones());
        return ResponseEntity.ok().build();
    }

    @Data
    public static class ActualizarPromedioRequest {
        private Double promedio;
        private Integer totalCalificaciones;
    }
}
