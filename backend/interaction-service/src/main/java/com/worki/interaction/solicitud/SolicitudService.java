package com.worki.interaction.solicitud;

import com.worki.interaction.solicitud.dto.ActualizarEstadoRequest;
import com.worki.interaction.solicitud.dto.CrearSolicitudRequest;
import com.worki.interaction.solicitud.dto.SolicitudResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SolicitudService {

    private final SolicitudRepository solicitudRepository;

    // ─────────────────────────────────────────────────────────────────────────
    // CREAR
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Crea una nueva solicitud de servicio.
     * Valida que no exista ya una solicitud PENDIENTE o ACEPTADA del mismo
     * cliente para el mismo oficio (evita duplicados activos).
     */
    public SolicitudResponse crearSolicitud(CrearSolicitudRequest request) {
        boolean yaExiste = solicitudRepository.existsByClienteIdAndOficioIdAndEstadoIn(
                request.getClienteId(),
                request.getOficioId(),
                List.of(EstadoSolicitud.PENDIENTE, EstadoSolicitud.ACEPTADA)
        );

        if (yaExiste) {
            throw new IllegalStateException(
                    "Ya existe una solicitud activa para este oficio. Espera la respuesta del trabajador.");
        }

        Solicitud nuevaSolicitud = Solicitud.builder()
                .clienteId(request.getClienteId())
                .trabajadorId(request.getTrabajadorId())
                .oficioId(request.getOficioId())
                .descripcion(request.getDescripcion())
                .build();

        Solicitud guardada = solicitudRepository.save(nuevaSolicitud);
        return toResponse(guardada);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LEER
    // ─────────────────────────────────────────────────────────────────────────

    /** Obtiene una solicitud por su ID */
    @Transactional(readOnly = true)
    public SolicitudResponse obtenerPorId(Long id) {
        return toResponse(buscarOFallar(id));
    }

    /** Lista todas las solicitudes enviadas por un cliente */
    @Transactional(readOnly = true)
    public List<SolicitudResponse> listarPorCliente(Long clienteId) {
        return solicitudRepository.findByClienteId(clienteId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    /** Lista todas las solicitudes recibidas por un trabajador */
    @Transactional(readOnly = true)
    public List<SolicitudResponse> listarPorTrabajador(Long trabajadorId) {
        return solicitudRepository.findByTrabajadorId(trabajadorId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    /** Lista solicitudes de un trabajador filtradas por estado */
    @Transactional(readOnly = true)
    public List<SolicitudResponse> listarPorTrabajadorYEstado(Long trabajadorId, EstadoSolicitud estado) {
        return solicitudRepository.findByTrabajadorIdAndEstado(trabajadorId, estado)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ACTUALIZAR ESTADO
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Actualiza el estado de una solicitud aplicando las transiciones válidas:
     *  PENDIENTE → ACEPTADA | RECHAZADA | CANCELADA
     *  ACEPTADA  → COMPLETADA | CANCELADA
     */
    public SolicitudResponse actualizarEstado(Long id, ActualizarEstadoRequest request) {
        Solicitud solicitud = buscarOFallar(id);
        validarTransicion(solicitud.getEstado(), request.getEstado());
        solicitud.setEstado(request.getEstado());
        return toResponse(solicitudRepository.save(solicitud));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS PRIVADOS
    // ─────────────────────────────────────────────────────────────────────────

    private Solicitud buscarOFallar(Long id) {
        return solicitudRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException(
                        "Solicitud no encontrada con ID: " + id));
    }

    /**
     * Reglas de transición de estado.
     * Lanza IllegalStateException si la transición no está permitida.
     */
    private void validarTransicion(EstadoSolicitud actual, EstadoSolicitud nuevo) {
        boolean valida = switch (actual) {
            case PENDIENTE -> nuevo == EstadoSolicitud.ACEPTADA
                    || nuevo == EstadoSolicitud.RECHAZADA
                    || nuevo == EstadoSolicitud.CANCELADA;
            case ACEPTADA  -> nuevo == EstadoSolicitud.COMPLETADA
                    || nuevo == EstadoSolicitud.CANCELADA;
            case RECHAZADA, COMPLETADA, CANCELADA -> false; // estados terminales
        };

        if (!valida) {
            throw new IllegalStateException(
                    String.format("Transición inválida de %s a %s", actual, nuevo));
        }
    }

    /** Convierte una entidad Solicitud al DTO de respuesta */
    private SolicitudResponse toResponse(Solicitud s) {
        return SolicitudResponse.builder()
                .id(s.getId())
                .clienteId(s.getClienteId())
                .trabajadorId(s.getTrabajadorId())
                .oficioId(s.getOficioId())
                .estado(s.getEstado())
                .descripcion(s.getDescripcion())
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                .build();
    }
}
