package com.worki.interaction.solicitud.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CrearSolicitudRequest {

    @NotNull(message = "El ID del trabajador es obligatorio")
    private Long trabajadorId;

    // oficioId opcional — pendiente implementación de PerfilOficio (un trabajador puede tener múltiples oficios)
    private Long oficioId;

    @NotBlank(message = "La descripción es obligatoria")
    @Size(max = 2000, message = "La descripción no puede superar los 2000 caracteres")
    private String descripcion;

    private LocalDateTime fechaHoraPreferida;

    private String direccion;

    private Double clienteLatitud;

    private Double clienteLongitud;
}