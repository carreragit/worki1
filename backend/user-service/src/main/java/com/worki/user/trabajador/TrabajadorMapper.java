package com.worki.user.trabajador;

import com.worki.user.trabajador.dto.TrabajadorRequestDTO;
import com.worki.user.trabajador.dto.TrabajadorResponseDTO;
import org.springframework.stereotype.Component;

@Component
public class TrabajadorMapper {

    public Trabajador toEntity(TrabajadorRequestDTO dto) {
        return Trabajador.builder()
                .perfilId(dto.getPerfilId())
                .latitud(dto.getLatitud())
                .longitud(dto.getLongitud())
                .radioKm(dto.getRadioKm())
                .build();
    }

    public TrabajadorResponseDTO toDTO(Trabajador t) {
        TrabajadorResponseDTO dto = new TrabajadorResponseDTO();
        dto.setId(t.getId());
        dto.setPerfilId(t.getPerfilId());
        dto.setLatitud(t.getLatitud());
        dto.setLongitud(t.getLongitud());
        dto.setRadioKm(t.getRadioKm());
        return dto;
    }

    public void updateEntity(Trabajador trabajador, TrabajadorRequestDTO dto) {
        trabajador.setLatitud(dto.getLatitud());
        trabajador.setLongitud(dto.getLongitud());
        trabajador.setRadioKm(dto.getRadioKm());
    }
}
