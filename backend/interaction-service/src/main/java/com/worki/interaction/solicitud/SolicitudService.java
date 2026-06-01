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

    public SolicitudResponse crearSolicitud(Long clienteId, CrearSolicitudRequest request) {
        boolean yaExiste = (request.getOficioId() != null)
                ? solicitudRepository.existsByClienteIdAndOficioIdAndEstadoIn(
                        clienteId, request.getOficioId(),
                        List.of(EstadoSolicitud.PENDIENTE, EstadoSolicitud.ACEPTADA))
                : solicitudRepository.existsByClienteIdAndTrabajadorIdAndEstadoIn(
                        clienteId, request.getTrabajadorId(),
                        List.of(EstadoSolicitud.PENDIENTE, EstadoSolicitud.ACEPTADA));

        if (yaExiste) {
            throw new IllegalStateException(
                    "Ya existe una solicitud activa para este trabajador. Espera la respuesta del trabajador.");
        }

        Solicitud nuevaSolicitud = Solicitud.builder()
                .clienteId(clienteId)
                .trabajadorId(request.getTrabajadorId())
                .oficioId(request.getOficioId())
                .descripcion(request.getDescripcion())
                .fechaHoraPreferida(request.getFechaHoraPreferida())
                .direccion(request.getDireccion())
                .build();

        Solicitud guardada = solicitudRepository.save(nuevaSolicitud);
        return toResponse(guardada);
    }

    @Transactional(readOnly = true)
    public SolicitudResponse obtenerPorId(Long id) {
        return toResponse(buscarOFallar(id));
    }

    @Transactional(readOnly = true)
    public List<SolicitudResponse> listarPorCliente(Long clienteId) {
        return solicitudRepository.findByClienteId(clienteId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SolicitudResponse> listarPorTrabajador(Long trabajadorId) {
        return solicitudRepository.findByTrabajadorId(trabajadorId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SolicitudResponse> listarPorTrabajadorYEstado(Long trabajadorId, EstadoSolicitud estado) {
        return solicitudRepository.findByTrabajadorIdAndEstado(trabajadorId, estado)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public SolicitudResponse actualizarEstado(Long id, ActualizarEstadoRequest request) {
        Solicitud solicitud = buscarOFallar(id);
        validarTransicion(solicitud.getEstado(), request.getEstado());
        solicitud.setEstado(request.getEstado());
        return toResponse(solicitudRepository.save(solicitud));
    }

    private Solicitud buscarOFallar(Long id) {
        return solicitudRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException(
                        "Solicitud no encontrada con ID: " + id));
    }

    private void validarTransicion(EstadoSolicitud actual, EstadoSolicitud nuevo) {
        boolean valida = switch (actual) {
            case PENDIENTE -> nuevo == EstadoSolicitud.ACEPTADA
                    || nuevo == EstadoSolicitud.RECHAZADA
                    || nuevo == EstadoSolicitud.CANCELADA;
            case ACEPTADA  -> nuevo == EstadoSolicitud.COMPLETADA
                    || nuevo == EstadoSolicitud.CANCELADA;
            case RECHAZADA, COMPLETADA, CANCELADA -> false;
        };
        if (!valida) {
            throw new IllegalStateException(
                    String.format("Transición inválida de %s a %s", actual, nuevo));
        }
    }

    private SolicitudResponse toResponse(Solicitud s) {
        return SolicitudResponse.builder()
                .id(s.getId())
                .clienteId(s.getClienteId())
                .trabajadorId(s.getTrabajadorId())
                .oficioId(s.getOficioId())
                .estado(s.getEstado())
                .descripcion(s.getDescripcion())
                .fechaHoraPreferida(s.getFechaHoraPreferida())
                .direccion(s.getDireccion())
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                .build();
    }
}
