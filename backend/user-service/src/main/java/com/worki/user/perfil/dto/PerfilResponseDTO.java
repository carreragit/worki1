package com.worki.user.perfil.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class PerfilResponseDTO {

    private Long id;
    private Long usuarioId;
    private String nombreCompleto;
    private String telefono;
    private String fotoPerfil;
    private String descripcion;
    private LocalDate fechaNacimiento;
    private String ciudad;
    private String region;
}
