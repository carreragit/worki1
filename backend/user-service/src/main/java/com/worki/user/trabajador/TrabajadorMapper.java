package com.worki.user.trabajador;

import com.worki.user.trabajador.dto.TrabajadorRequestDTO;
import com.worki.user.trabajador.dto.TrabajadorResponseDTO;
import org.springframework.stereotype.Component;

@Component
public class TrabajadorMapper {

    public Trabajador toEntity(TrabajadorRequestDTO dto) {
        return Trabajador.builder()
                .perfilId(dto.getPerfilId())
                .especialidad(dto.getEspecialidad())
                .descripcionServicio(dto.getDescripcionServicio())
                .tarifaHora(dto.getTarifaHora())
                .latitud(dto.getLatitud())
                .longitud(dto.getLongitud())
                .radioKm(dto.getRadioKm())
                .disponible(dto.getDisponible() != null ? dto.getDisponible() : true)
                .build();
    }

    public TrabajadorResponseDTO toDTO(Trabajador t) {
        TrabajadorResponseDTO dto = new TrabajadorResponseDTO();
        dto.setId(t.getId());
        dto.setPerfilId(t.getPerfilId());
        dto.setEspecialidad(t.getEspecialidad());
        dto.setDescripcionServicio(t.getDescripcionServicio());
        dto.setTarifaHora(t.getTarifaHora());
        dto.setLatitud(t.getLatitud());
        dto.setLongitud(t.getLongitud());
        dto.setRadioKm(t.getRadioKm());
        dto.setDisponible(t.getDisponible());
        dto.setPromedioCalificacion(t.getPromedioCalificacion());
        dto.setTotalCalificaciones(t.getTotalCalificaciones());
        return dto;
    }

    public void updateEntity(Trabajador trabajador, TrabajadorRequestDTO dto) {
        trabajador.setEspecialidad(dto.getEspecialidad());
        trabajador.setDescripcionServicio(dto.getDescripcionServicio());
        trabajador.setTarifaHora(dto.getTarifaHora());
        trabajador.setLatitud(dto.getLatitud());
        trabajador.setLongitud(dto.getLongitud());
        trabajador.setRadioKm(dto.getRadioKm());
        if (dto.getDisponible() != null) {
            trabajador.setDisponible(dto.getDisponible());
        }
    }
}
