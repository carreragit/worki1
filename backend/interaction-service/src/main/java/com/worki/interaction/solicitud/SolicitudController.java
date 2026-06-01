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

@RestController
@RequestMapping("/api/interacciones/solicitudes")
@RequiredArgsConstructor
public class SolicitudController {

    private final SolicitudService solicitudService;

    @PostMapping
    public ResponseEntity<SolicitudResponse> crear(
            @RequestHeader("X-User-Id") Long clienteId,
            @Valid @RequestBody CrearSolicitudRequest request) {
        SolicitudResponse response = solicitudService.crearSolicitud(clienteId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SolicitudResponse> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(solicitudService.obtenerPorId(id));
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<SolicitudResponse>> listarPorCliente(@PathVariable Long clienteId) {
        return ResponseEntity.ok(solicitudService.listarPorCliente(clienteId));
    }

    @GetMapping("/trabajador/{trabajadorId}")
    public ResponseEntity<List<SolicitudResponse>> listarPorTrabajador(
            @PathVariable Long trabajadorId,
            @RequestParam(required = false) EstadoSolicitud estado) {
        if (estado != null) {
            return ResponseEntity.ok(solicitudService.listarPorTrabajadorYEstado(trabajadorId, estado));
        }
        return ResponseEntity.ok(solicitudService.listarPorTrabajador(trabajadorId));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<SolicitudResponse> actualizarEstado(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarEstadoRequest request) {
        return ResponseEntity.ok(solicitudService.actualizarEstado(id, request));
    }
}
