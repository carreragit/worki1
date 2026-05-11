package com.worki.interaction.calificacion;

import com.worki.interaction.calificacion.dto.CalificacionResponse;
import com.worki.interaction.calificacion.dto.CrearCalificacionRequest;
import com.worki.interaction.calificacion.dto.PromedioCalificacionResponse;
import com.worki.interaction.solicitud.EstadoSolicitud;
import com.worki.interaction.solicitud.Solicitud;
import com.worki.interaction.solicitud.SolicitudRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CalificacionService {

    private final CalificacionRepository calificacionRepository;
    private final SolicitudRepository solicitudRepository;

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

        Calificacion nueva = Calificacion.builder()
                .solicitudId(request.getSolicitudId())
                .oficioId(request.getOficioId())
                .evaluadorId(request.getEvaluadorId())
                .evaluadoId(request.getEvaluadoId())
                .puntaje(request.getPuntaje())
                .comentario(request.getComentario())
                .build();

        return toResponse(calificacionRepository.save(nueva));
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
                .build();
    }
}
