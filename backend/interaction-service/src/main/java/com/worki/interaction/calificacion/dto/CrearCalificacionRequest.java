package com.worki.interaction.calificacion.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CrearCalificacionRequest {

    @NotNull(message = "El ID de la solicitud es obligatorio")
    private Long solicitudId;

    // Opcional — si no viene, CalificacionService lo obtiene de la solicitud
    private Long oficioId;

    @NotNull(message = "El ID del evaluador es obligatorio")
    private Long evaluadorId;

    @NotNull(message = "El ID del evaluado es obligatorio")
    private Long evaluadoId;

    @NotNull(message = "El puntaje es obligatorio")
    @Min(value = 1, message = "El puntaje mínimo es 1")
    @Max(value = 5, message = "El puntaje máximo es 5")
    private Integer puntaje;

    @Size(max = 1000, message = "El comentario no puede superar los 1000 caracteres")
    private String comentario;
}
