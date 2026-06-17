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
    private LocalDateTime fechaHoraPreferida;
    private String direccion;
    private Double clienteLatitud;
    private Double clienteLongitud;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // Resueltos por SolicitudService llamando a user-service.
    // Permiten al móvil mostrar nombres directamente sin una segunda solicitud HTTP.
    private String nombreCliente;
    private String nombreTrabajador;
    private String nombreOficio;
    private String codigoVerificacion;
}