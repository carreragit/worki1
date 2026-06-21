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

    // Distancia en km entre el cliente y el trabajador, calculada con Haversine
    // en el endpoint /mapa. Permite mostrar y ordenar por cercanía en el frontend.
    private Double distanciaKm;

    // Datos del perfil del trabajador, enriquecidos en OficioService para evitar
    // que el frontend tenga que hacer una segunda llamada a user-service
    private String nombreTrabajador;
    private String fotoPerfil;
}
