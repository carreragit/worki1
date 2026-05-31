package com.worki.interaction.calificacion;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CalificacionRepository extends JpaRepository<Calificacion, Long> {

    /** Todas las calificaciones recibidas por un usuario evaluado */
    List<Calificacion> findByEvaluadoId(Long evaluadoId);

    /** Todas las calificaciones asociadas a una solicitud */
    List<Calificacion> findBySolicitudId(Long solicitudId);

    /** Calificaciones por oficio (para calcular el rating del oficio) */
    List<Calificacion> findByOficioId(Long oficioId);

    /** Verifica si el evaluador ya calificó esta solicitud (evita duplicados) */
    boolean existsBySolicitudIdAndEvaluadorId(Long solicitudId, Long evaluadorId);

    /** Calificación específica de un evaluador sobre una solicitud */
    Optional<Calificacion> findBySolicitudIdAndEvaluadorId(Long solicitudId, Long evaluadorId);

    /**
     * Promedio de puntaje de un oficio específico.
     * Usado por user-service para actualizar el rating calculado del Oficio.
     */
    @Query("SELECT AVG(c.puntaje) FROM Calificacion c WHERE c.oficioId = :oficioId")
    Optional<Double> calcularPromedioPorOficio(@Param("oficioId") Long oficioId);

    /**
     * Promedio de puntaje global de un usuario evaluado
     * (usado para el rating general del trabajador o cliente).
     */
    @Query("SELECT AVG(c.puntaje) FROM Calificacion c WHERE c.evaluadoId = :evaluadoId")
    Optional<Double> calcularPromedioGlobalPorEvaluado(@Param("evaluadoId") Long evaluadoId);
}
