package com.worki.interaction.solicitud.dto;

import com.worki.interaction.solicitud.EstadoSolicitud;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SolicitudResponse {

    private Long id;
    private Long clienteId;
    private Long trabajadorId;
    private Long oficioId;
    private EstadoSolicitud estado;
    private String descripcion;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
