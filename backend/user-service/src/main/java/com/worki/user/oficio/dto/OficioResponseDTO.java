package com.worki.user.oficio.dto;

import lombok.Data;

@Data
public class OficioResponseDTO {

    private Long id;
    private Long trabajadorId;
    private String especialidad;
    private String nombreServicio;
    private String descripcionServicio;
    private Integer tarifaHora;
    private Integer tarifaServicioBase;
    private Boolean activo;
    private Double promedioCalificacion;
    private Integer totalCalificaciones;

    // Coordenadas del trabajador, presentes solo en respuestas del endpoint /mapa
    private Double latitud;
    private Double longitud;
    private Double radioKm;
}
