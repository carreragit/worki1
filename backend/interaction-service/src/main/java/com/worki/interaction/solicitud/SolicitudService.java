package com.worki.interaction.solicitud;

import com.worki.interaction.solicitud.dto.ActualizarEstadoRequest;
import com.worki.interaction.solicitud.dto.CrearSolicitudRequest;
import com.worki.interaction.solicitud.dto.SolicitudResponse;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SolicitudService {

    private final SolicitudRepository solicitudRepository;
    private final RestTemplate restTemplate;

    @Value("${user-service.url}")
    private String userServiceUrl;

    public SolicitudResponse crearSolicitud(Long clienteId, CrearSolicitudRequest request) {
        boolean yaExiste = (request.getOficioId() != null)
                ? solicitudRepository.existsByClienteIdAndOficioIdAndEstadoIn(
                        clienteId, request.getOficioId(),
                        List.of(EstadoSolicitud.PENDIENTE, EstadoSolicitud.ACEPTADA, EstadoSolicitud.EN_PROCESO))
                : solicitudRepository.existsByClienteIdAndTrabajadorIdAndEstadoIn(
                        clienteId, request.getTrabajadorId(),
                        List.of(EstadoSolicitud.PENDIENTE, EstadoSolicitud.ACEPTADA, EstadoSolicitud.EN_PROCESO));

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
                .clienteLatitud(request.getClienteLatitud())
                .clienteLongitud(request.getClienteLongitud())
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

    public SolicitudResponse generarCodigo(Long id) {
        Solicitud solicitud = buscarOFallar(id);
        if (solicitud.getEstado() != EstadoSolicitud.ACEPTADA) {
            throw new IllegalStateException("Solo se puede generar código cuando la solicitud está ACEPTADA");
        }
        solicitud.setCodigoVerificacion(String.format("%04d", new java.util.Random().nextInt(10000)));
        return toResponse(solicitudRepository.save(solicitud));
    }

    public SolicitudResponse verificarCodigo(Long id, String codigo) {
        Solicitud solicitud = buscarOFallar(id);
        if (solicitud.getEstado() != EstadoSolicitud.ACEPTADA) {
            throw new IllegalStateException("La solicitud no está en estado ACEPTADA");
        }
        if (solicitud.getCodigoVerificacion() == null) {
            throw new IllegalStateException("No hay código generado para esta solicitud");
        }
        if (!solicitud.getCodigoVerificacion().equals(codigo)) {
            throw new IllegalStateException("Código incorrecto");
        }
        solicitud.setEstado(EstadoSolicitud.EN_PROCESO);
        solicitud.setCodigoVerificacion(null);
        return toResponse(solicitudRepository.save(solicitud));
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
            case EN_PROCESO -> nuevo == EstadoSolicitud.COMPLETADA
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
                .clienteLatitud(s.getClienteLatitud())
                .clienteLongitud(s.getClienteLongitud())
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                // Llamamos a user-service para obtener los nombres. Si falla por cualquier
                // razón (user-service caído, usuario borrado), se devuelve un fallback
                // genérico para no romper la respuesta completa
                .nombreCliente(resolverNombre(s.getClienteId()))
                .nombreTrabajador(resolverNombreTrabajador(s.getTrabajadorId()))
                .nombreOficio(resolverNombreOficio(s.getOficioId()))
                .codigoVerificacion(s.getCodigoVerificacion())
                .build();
    }

    // DTO mínimo para deserializar solo el campo que nos importa del perfil
    @Data
    private static class PerfilDto {
        private Long id;
        private String nombreCompleto;
    }

    // DTO mínimo para deserializar solo el nombre del oficio
    @Data
    private static class OficioDto {
        private Long id;
        private String nombreServicio;
        private String especialidad;
    }

    // Resuelve el nombre del cliente usando su usuarioId (campo sub del JWT).
    private String resolverNombre(Long usuarioId) {
        try {
            PerfilDto perfil = restTemplate.getForObject(
                userServiceUrl + "/internal/perfiles/usuario/" + usuarioId,
                PerfilDto.class
            );
            return perfil != null ? perfil.getNombreCompleto() : "Usuario #" + usuarioId;
        } catch (Exception e) {
            return "Usuario #" + usuarioId;
        }
    }

    // Resuelve el nombre del trabajador usando su trabajadorId (id en tabla trabajadores,
    // distinto del usuarioId). El endpoint /internal/perfiles/trabajador hace el join
    // trabajadores → perfiles internamente en user-service.
    private String resolverNombreTrabajador(Long trabajadorId) {
        try {
            PerfilDto perfil = restTemplate.getForObject(
                userServiceUrl + "/internal/perfiles/trabajador/" + trabajadorId,
                PerfilDto.class
            );
            return perfil != null ? perfil.getNombreCompleto() : "Técnico #" + trabajadorId;
        } catch (Exception e) {
            return "Técnico #" + trabajadorId;
        }
    }

    private String resolverNombreOficio(Long oficioId) {
        if (oficioId == null) return null;
        try {
            OficioDto oficio = restTemplate.getForObject(
                userServiceUrl + "/internal/oficios/" + oficioId,
                OficioDto.class
            );
            if (oficio == null) return null;
            return oficio.getNombreServicio() != null ? oficio.getNombreServicio() : oficio.getEspecialidad();
        } catch (Exception e) {
            return null;
        }
    }
}