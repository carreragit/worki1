package com.worki.user.trabajador.dto;

import lombok.Data;

@Data
public class TrabajadorResponseDTO {

    private Long id;
    private Long perfilId;
    private Double latitud;
    private Double longitud;
    private Double radioKm;
}
