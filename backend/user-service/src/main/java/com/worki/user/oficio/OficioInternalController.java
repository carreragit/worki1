package com.worki.user.oficio;

// Controlador exclusivo para comunicación interna entre microservicios.
// NO está expuesto al gateway ni al exterior — solo lo llaman otros servicios
// directamente por su puerto (8082). Sigue el patrón /internal/** definido
// en la arquitectura del proyecto.

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/internal/oficios")
@RequiredArgsConstructor
public class OficioInternalController {

    private final OficioService oficioService;

    // Recibe el promedio y total de calificaciones calculados por interaction-service
    // y los persiste en el Oficio correspondiente. Se invoca cada vez que
    // un cliente o trabajador registra una nueva calificacion.
    @PatchMapping("/{id}/promedio")
    public ResponseEntity<Void> actualizarPromedio(
            @PathVariable Long id,
            @RequestBody ActualizarPromedioRequest request) {
        oficioService.actualizarPromedio(id, request.getPromedio(), request.getTotalCalificaciones());
        return ResponseEntity.noContent().build();
    }

    @Data
    public static class ActualizarPromedioRequest {
        private Double promedio;
        private Integer totalCalificaciones;
    }
}
