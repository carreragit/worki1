package com.worki.interaction.solicitud;

import com.worki.interaction.solicitud.dto.ActualizarEstadoRequest;
import com.worki.interaction.solicitud.dto.CrearSolicitudRequest;
import com.worki.interaction.solicitud.dto.SolicitudResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller para gestión de solicitudes de servicio.
 * Puerto: 8084 — Base path: /api/solicitudes
 */
@RestController
@RequestMapping("/api/solicitudes")
@RequiredArgsConstructor
public class SolicitudController {

    private final SolicitudService solicitudService;

    // ─── POST /api/solicitudes ────────────────────────────────────────────────

    /**
     * Crea una nueva solicitud de servicio.
     * El cliente indica qué oficio (trabajador + tipo de trabajo) desea contratar.
     */
    @PostMapping
    public ResponseEntity<SolicitudResponse> crear(@Valid @RequestBody CrearSolicitudRequest request) {
        SolicitudResponse response = solicitudService.crearSolicitud(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ─── GET /api/solicitudes/{id} ────────────────────────────────────────────

    @GetMapping("/{id}")
    public ResponseEntity<SolicitudResponse> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(solicitudService.obtenerPorId(id));
    }

    // ─── GET /api/solicitudes/cliente/{clienteId} ─────────────────────────────

    /**
     * Devuelve todas las solicitudes enviadas por un cliente.
     */
    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<SolicitudResponse>> listarPorCliente(@PathVariable Long clienteId) {
        return ResponseEntity.ok(solicitudService.listarPorCliente(clienteId));
    }

    // ─── GET /api/solicitudes/trabajador/{trabajadorId} ───────────────────────

    /**
     * Devuelve todas las solicitudes recibidas por un trabajador.
     * Opcionalmente filtra por estado (?estado=PENDIENTE).
     */
    @GetMapping("/trabajador/{trabajadorId}")
    public ResponseEntity<List<SolicitudResponse>> listarPorTrabajador(
            @PathVariable Long trabajadorId,
            @RequestParam(required = false) EstadoSolicitud estado) {

        if (estado != null) {
            return ResponseEntity.ok(solicitudService.listarPorTrabajadorYEstado(trabajadorId, estado));
        }
        return ResponseEntity.ok(solicitudService.listarPorTrabajador(trabajadorId));
    }

    // ─── PATCH /api/solicitudes/{id}/estado ───────────────────────────────────

    /**
     * Actualiza el estado de una solicitud (ACEPTADA, RECHAZADA, COMPLETADA, CANCELADA).
     * Solo se permiten transiciones de estado válidas (ver SolicitudService).
     */
    @PatchMapping("/{id}/estado")
    public ResponseEntity<SolicitudResponse> actualizarEstado(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarEstadoRequest request) {
        return ResponseEntity.ok(solicitudService.actualizarEstado(id, request));
    }
}
