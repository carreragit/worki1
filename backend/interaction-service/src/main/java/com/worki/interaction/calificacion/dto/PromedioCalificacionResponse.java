package com.worki.interaction.calificacion.dto;

import lombok.Builder;
import lombok.Data;

/**
 * Resumen agregado del promedio de calificaciones.
 * Retornado cuando se consulta el rating de un oficio o de un usuario evaluado.
 */
@Data
@Builder
public class PromedioCalificacionResponse {

    /** ID de referencia: puede ser un oficioId o un evaluadoId */
    private Long referenciaId;

    /** Tipo de referencia: "OFICIO" o "USUARIO" */
    private String tipo;

    /** Promedio calculado (null si no hay calificaciones) */
    private Double promedio;

    /** Cantidad de calificaciones consideradas */
    private Long totalCalificaciones;
}
