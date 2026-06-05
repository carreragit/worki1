package com.worki.interaction.calificacion;

import com.worki.interaction.calificacion.dto.CalificacionResponse;
import com.worki.interaction.calificacion.dto.CrearCalificacionRequest;
import com.worki.interaction.calificacion.dto.PromedioCalificacionResponse;
import com.worki.interaction.solicitud.EstadoSolicitud;
import com.worki.interaction.solicitud.Solicitud;
import com.worki.interaction.solicitud.SolicitudRepository;
import jakarta.persistence.EntityNotFoundException;
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
public class CalificacionService {

    private final CalificacionRepository calificacionRepository;
    private final SolicitudRepository solicitudRepository;
    private final RestTemplate restTemplate;

    @Value("${user-service.url}")
    private String userServiceUrl;

    // ─────────────────────────────────────────────────────────────────────────
    // CREAR
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Registra una calificación sobre una solicitud COMPLETADA.
     * Reglas de negocio:
     *  1. La solicitud debe existir y estar en estado COMPLETADA.
     *  2. El evaluador no puede haber calificado esta solicitud antes (uniqueConstraint).
     *  3. El evaluador debe ser el cliente o el trabajador de la solicitud.
     */
    public CalificacionResponse crearCalificacion(CrearCalificacionRequest request) {
        // Validar que la solicitud exista y esté completada
        Solicitud solicitud = solicitudRepository.findById(request.getSolicitudId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Solicitud no encontrada con ID: " + request.getSolicitudId()));

        if (solicitud.getEstado() != EstadoSolicitud.COMPLETADA) {
            throw new IllegalStateException(
                    "Solo se puede calificar una solicitud que esté en estado COMPLETADA. " +
                    "Estado actual: " + solicitud.getEstado());
        }

        // Validar que el evaluador sea parte de la solicitud
        Long evaluadorId = request.getEvaluadorId();
        if (!evaluadorId.equals(solicitud.getClienteId()) &&
            !evaluadorId.equals(solicitud.getTrabajadorId())) {
            throw new IllegalStateException(
                    "El evaluador no forma parte de esta solicitud.");
        }

        // Validar que no haya calificado ya
        if (calificacionRepository.existsBySolicitudIdAndEvaluadorId(
                request.getSolicitudId(), request.getEvaluadorId())) {
            throw new IllegalStateException(
                    "Ya calificaste esta solicitud. Solo se permite una calificación por parte.");
        }

        // Si oficioId no viene en el request, se toma de la solicitud
        Long oficioId = request.getOficioId() != null
                ? request.getOficioId()
                : solicitud.getOficioId();

        Calificacion nueva = Calificacion.builder()
                .solicitudId(request.getSolicitudId())
                .oficioId(oficioId)
                .evaluadorId(request.getEvaluadorId())
                .evaluadoId(request.getEvaluadoId())
                .puntaje(request.getPuntaje())
                .comentario(request.getComentario())
                .build();

        CalificacionResponse response = toResponse(calificacionRepository.save(nueva));

        // Actualizar promedio del oficio en user-service (no crítico — no revierte la calificación)
        if (oficioId != null) {
            try {
                actualizarPromedioEnUserService(oficioId);
            } catch (Exception e) {
                System.err.println("[CalificacionService] Error actualizando promedio oficio " + oficioId + ": " + e.getMessage());
            }
        }

        return response;
    }

    // Recalcula el promedio del oficio y lo envía a user-service para que quede
    // guardado directamente en el registro del Oficio. Así el frontend no necesita
    // llamar a interaction-service cada vez que quiera mostrar el rating.
    private void actualizarPromedioEnUserService(Long oficioId) {
        Double promedio = calificacionRepository.calcularPromedioPorOficio(oficioId).orElse(0.0);
        int total = calificacionRepository.findByOficioId(oficioId).size();

        ActualizarPromedioRequest body = new ActualizarPromedioRequest();
        // Redondeamos a 2 decimales para no guardar valores como 3.666666...
        body.setPromedio(Math.round(promedio * 100.0) / 100.0);
        body.setTotalCalificaciones(total);

        String url = userServiceUrl + "/internal/oficios/" + oficioId + "/promedio";
        restTemplate.patchForObject(url, body, Void.class);
    }

    // DTO interno para el body del PATCH a user-service
    @Data
    private static class ActualizarPromedioRequest {
        private Double promedio;
        private Integer totalCalificaciones;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LEER
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public CalificacionResponse obtenerPorId(Long id) {
        return toResponse(buscarOFallar(id));
    }

    /** Lista todas las calificaciones recibidas por un usuario */
    @Transactional(readOnly = true)
    public List<CalificacionResponse> listarPorEvaluado(Long evaluadoId) {
        return calificacionRepository.findByEvaluadoId(evaluadoId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    /** Lista todas las calificaciones de una solicitud */
    @Transactional(readOnly = true)
    public List<CalificacionResponse> listarPorSolicitud(Long solicitudId) {
        return calificacionRepository.findBySolicitudId(solicitudId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    /**
     * Calcula el promedio de calificaciones de un oficio específico.
     * Endpoint clave: user-service lo puede llamar para actualizar
     * el campo ratingPromedio del Oficio.
     */
    @Transactional(readOnly = true)
    public PromedioCalificacionResponse promedioOficio(Long oficioId) {
        List<Calificacion> calificaciones = calificacionRepository.findByOficioId(oficioId);
        Double promedio = calificacionRepository.calcularPromedioPorOficio(oficioId).orElse(null);

        return PromedioCalificacionResponse.builder()
                .referenciaId(oficioId)
                .tipo("OFICIO")
                .promedio(promedio != null ? Math.round(promedio * 100.0) / 100.0 : null)
                .totalCalificaciones((long) calificaciones.size())
                .build();
    }

    /**
     * Calcula el promedio global de calificaciones recibidas por un usuario.
     */
    @Transactional(readOnly = true)
    public PromedioCalificacionResponse promedioUsuario(Long evaluadoId) {
        List<Calificacion> calificaciones = calificacionRepository.findByEvaluadoId(evaluadoId);
        Double promedio = calificacionRepository.calcularPromedioGlobalPorEvaluado(evaluadoId).orElse(null);

        return PromedioCalificacionResponse.builder()
                .referenciaId(evaluadoId)
                .tipo("USUARIO")
                .promedio(promedio != null ? Math.round(promedio * 100.0) / 100.0 : null)
                .totalCalificaciones((long) calificaciones.size())
                .build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS PRIVADOS
    // ─────────────────────────────────────────────────────────────────────────

    private Calificacion buscarOFallar(Long id) {
        return calificacionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Calificacion no encontrada con ID: " + id));
    }

    private CalificacionResponse toResponse(Calificacion c) {
        return CalificacionResponse.builder()
                .id(c.getId())
                .solicitudId(c.getSolicitudId())
                .oficioId(c.getOficioId())
                .evaluadorId(c.getEvaluadorId())
                .evaluadoId(c.getEvaluadoId())
                .puntaje(c.getPuntaje())
                .comentario(c.getComentario())
                .createdAt(c.getCreatedAt())
                // Resolvemos el nombre del evaluador para mostrarlo en la UI sin otra llamada HTTP
                .nombreEvaluador(resolverNombre(c.getEvaluadorId()))
                .build();
    }

    // Consulta el nombre del evaluador a user-service. Si el servicio no responde,
    // devuelve null en lugar de fallar — el frontend puede mostrar "Anónimo" en ese caso
    private String resolverNombre(Long usuarioId) {
        try {
            PerfilDto perfil = restTemplate.getForObject(
                userServiceUrl + "/internal/perfiles/usuario/" + usuarioId,
                PerfilDto.class
            );
            return perfil != null ? perfil.getNombreCompleto() : null;
        } catch (Exception e) {
            return null;
        }
    }

    // DTO mínimo para deserializar la respuesta de /internal/perfiles/usuario/{id}
    @Data
    private static class PerfilDto {
        private Long id;
        private String nombreCompleto;
    }
}
