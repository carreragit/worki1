package com.worki.user.trabajador.dto;

import lombok.Data;

@Data
public class TrabajadorResponseDTO {

    private Long id;
    private Long perfilId;
    private String especialidad;
    private String descripcionServicio;
    private Integer tarifaHora;
    private Double latitud;
    private Double longitud;
    private Double radioKm;
    private Boolean disponible;
    private Double promedioCalificacion;
    private Integer totalCalificaciones;
}
