package com.worki.interaction.calificacion.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CalificacionResponse {

    private Long id;
    private Long solicitudId;
    private Long oficioId;
    private Long evaluadorId;
    private Long evaluadoId;
    private Integer puntaje;
    private String comentario;
    private LocalDateTime createdAt;
    // Resuelto por CalificacionService.resolverNombre() — puede ser null si user-service no responde
    private String nombreEvaluador;
}
