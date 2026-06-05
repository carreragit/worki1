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

    // Coordenadas para búsqueda geográfica (Haversine)
    @Column(nullable = false)
    private Double latitud;

    @Column(nullable = false)
    private Double longitud;

    // Radio en kilómetros en el que el trabajador opera
    private Double radioKm;
}
