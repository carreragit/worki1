package com.worki.user.oficio;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "oficios")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Oficio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long trabajadorId;

    @Column(nullable = false, length = 150)
    private String especialidad;

    @Column(nullable = false, length = 200)
    private String nombreServicio;

    @Column(columnDefinition = "TEXT")
    private String descripcionServicio;

    private Integer tarifaHora;

    private Integer tarifaServicioBase;

    // Controla si este oficio aparece activo en el mapa y búsquedas
    @Builder.Default
    private Boolean activo = true;

    // Actualizado por interaction-service al registrar calificaciones
    @Builder.Default
    private Double promedioCalificacion = 0.0;

    @Builder.Default
    private Integer totalCalificaciones = 0;
}
