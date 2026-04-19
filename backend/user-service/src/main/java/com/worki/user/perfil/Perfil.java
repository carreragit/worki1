package com.worki.user.perfil;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "perfiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Perfil {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ID del usuario que viene del auth-service (no hay FK real entre servicios)
    @Column(nullable = false, unique = true)
    private Long usuarioId;

    @Column(nullable = false, length = 100)
    private String nombreCompleto;

    @Column(length = 20)
    private String telefono;

    @Column(length = 255)
    private String fotoPerfil;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    private LocalDate fechaNacimiento;

    @Column(length = 100)
    private String ciudad;

    @Column(length = 100)
    private String region;
}
