package com.worki.interaction.solicitud.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CrearSolicitudRequest {

    @NotNull(message = "El ID del cliente es obligatorio")
    private Long clienteId;

    @NotNull(message = "El ID del trabajador es obligatorio")
    private Long trabajadorId;

    @NotNull(message = "El ID del oficio es obligatorio")
    private Long oficioId;

    @Size(max = 2000, message = "La descripción no puede superar los 2000 caracteres")
    private String descripcion;
}
