package com.worki.user.oficio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OficioRequestDTO {

    @NotNull
    private Long trabajadorId;

    @NotBlank
    private String especialidad;

    @NotBlank
    private String nombreServicio;

    private String descripcionServicio;

    private Integer tarifaHora;

    private Integer tarifaServicioBase;
}
