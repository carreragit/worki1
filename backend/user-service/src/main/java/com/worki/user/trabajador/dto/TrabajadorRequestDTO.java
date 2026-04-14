package com.worki.user.trabajador.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TrabajadorRequestDTO {

    @NotNull(message = "El perfilId es obligatorio")
    private Long perfilId;

    @NotBlank(message = "La especialidad es obligatoria")
    private String especialidad;

    private String descripcionServicio;
    private Integer tarifaHora;

    @NotNull(message = "La latitud es obligatoria")
    private Double latitud;

    @NotNull(message = "La longitud es obligatoria")
    private Double longitud;

    private Double radioKm;
    private Boolean disponible;
}
