package com.worki.user.trabajador;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "trabajadores")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Trabajador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Referencia al perfil dentro del mismo servicio
    @Column(nullable = false, unique = true)
    private Long perfilId;

    @Column(nullable = false, length = 150)
    private String especialidad;

    @Column(columnDefinition = "TEXT")
    private String descripcionServicio;

    // Tarifa en pesos (CLP)
    private Integer tarifaHora;

    // Coordenadas para búsqueda Haversine desde el publication-service
    @Column(nullable = false)
    private Double latitud;

    @Column(nullable = false)
    private Double longitud;

    // Radio en kilómetros en el que el trabajador está dispuesto a trabajar
    private Double radioKm;

    @Column(nullable = false)
    @Builder.Default
    private Boolean disponible = true;

    // Promedio calculado a partir de las calificaciones (actualizado por interaction-service)
    @Builder.Default
    private Double promedioCalificacion = 0.0;

    @Builder.Default
    private Integer totalCalificaciones = 0;
}
