package com.worki.interaction.calificacion;

import com.worki.interaction.calificacion.dto.CalificacionResponse;
import com.worki.interaction.calificacion.dto.CrearCalificacionRequest;
import com.worki.interaction.calificacion.dto.PromedioCalificacionResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller para calificaciones de servicio.
 * Puerto: 8084 — Base path: /api/interacciones/calificaciones
 * El gateway enruta /api/interacciones/** a este servicio.
 */
@RestController
@RequestMapping("/api/interacciones/calificaciones")
@RequiredArgsConstructor
public class CalificacionController {

    private final CalificacionService calificacionService;

    // ─── POST /api/calificaciones ─────────────────────────────────────────────

    /**
     * Registra una calificación sobre una solicitud COMPLETADA.
     * Solo se acepta una calificación por evaluador (cliente o trabajador) por solicitud.
     */
    @PostMapping
    public ResponseEntity<CalificacionResponse> crear(
            @Valid @RequestBody CrearCalificacionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(calificacionService.crearCalificacion(request));
    }

    // ─── GET /api/calificaciones/{id} ─────────────────────────────────────────

    @GetMapping("/{id}")
    public ResponseEntity<CalificacionResponse> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(calificacionService.obtenerPorId(id));
    }

    // ─── GET /api/calificaciones/usuario/{evaluadoId} ────────────────────────

    /**
     * Lista todas las calificaciones recibidas por un usuario (trabajador o cliente).
     */
    @GetMapping("/usuario/{evaluadoId}")
    public ResponseEntity<List<CalificacionResponse>> listarPorEvaluado(
            @PathVariable Long evaluadoId) {
        return ResponseEntity.ok(calificacionService.listarPorEvaluado(evaluadoId));
    }

    // ─── GET /api/calificaciones/solicitud/{solicitudId} ─────────────────────

    /**
     * Lista todas las calificaciones asociadas a una solicitud.
     * Una solicitud puede tener hasta 2 calificaciones (cliente→trabajador, trabajador→cliente).
     */
    @GetMapping("/solicitud/{solicitudId}")
    public ResponseEntity<List<CalificacionResponse>> listarPorSolicitud(
            @PathVariable Long solicitudId) {
        return ResponseEntity.ok(calificacionService.listarPorSolicitud(solicitudId));
    }

    // ─── GET /api/calificaciones/oficio/{oficioId} ────────────────────────────

    /**
     * Lista todas las calificaciones de un oficio específico.
     * Usado por PerfilTecnicoScreen para mostrar reseñas filtradas por oficio.
     */
    @GetMapping("/oficio/{oficioId}")
    public ResponseEntity<List<CalificacionResponse>> listarPorOficio(
            @PathVariable Long oficioId) {
        return ResponseEntity.ok(calificacionService.listarPorOficio(oficioId));
    }

    // ─── GET /api/calificaciones/promedio/oficio/{oficioId} ──────────────────

    /**
     * Devuelve el promedio de calificaciones de un oficio.
     * Puede ser consumido por user-service para actualizar el rating del Oficio.
     */
    @GetMapping("/promedio/oficio/{oficioId}")
    public ResponseEntity<PromedioCalificacionResponse> promedioOficio(
            @PathVariable Long oficioId) {
        return ResponseEntity.ok(calificacionService.promedioOficio(oficioId));
    }

    // ─── GET /api/calificaciones/promedio/usuario/{evaluadoId} ───────────────

    /**
     * Devuelve el promedio global de calificaciones de un usuario.
     */
    @GetMapping("/promedio/usuario/{evaluadoId}")
    public ResponseEntity<PromedioCalificacionResponse> promedioUsuario(
            @PathVariable Long evaluadoId) {
        return ResponseEntity.ok(calificacionService.promedioUsuario(evaluadoId));
    }
}
