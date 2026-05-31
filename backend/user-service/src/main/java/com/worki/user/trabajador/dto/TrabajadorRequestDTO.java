package com.worki.user.trabajador.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TrabajadorRequestDTO {

    @NotNull(message = "El perfilId es obligatorio")
    private Long perfilId;

    @NotNull(message = "La latitud es obligatoria")
    private Double latitud;

    @NotNull(message = "La longitud es obligatoria")
    private Double longitud;

    private Double radioKm;
}
