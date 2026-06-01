package com.worki.user.oficio;

import com.worki.user.oficio.dto.OficioRequestDTO;
import com.worki.user.oficio.dto.OficioResponseDTO;
import org.springframework.stereotype.Component;

@Component
public class OficioMapper {

    public Oficio toEntity(OficioRequestDTO dto) {
        return Oficio.builder()
                .trabajadorId(dto.getTrabajadorId())
                .especialidad(dto.getEspecialidad())
                .nombreServicio(dto.getNombreServicio())
                .descripcionServicio(dto.getDescripcionServicio())
                .tarifaHora(dto.getTarifaHora())
                .tarifaServicioBase(dto.getTarifaServicioBase())
                .build();
    }

    public OficioResponseDTO toDTO(Oficio o) {
        OficioResponseDTO dto = new OficioResponseDTO();
        dto.setId(o.getId());
        dto.setTrabajadorId(o.getTrabajadorId());
        dto.setEspecialidad(o.getEspecialidad());
        dto.setNombreServicio(o.getNombreServicio());
        dto.setDescripcionServicio(o.getDescripcionServicio());
        dto.setTarifaHora(o.getTarifaHora());
        dto.setTarifaServicioBase(o.getTarifaServicioBase());
        dto.setActivo(o.getActivo());
        dto.setPromedioCalificacion(o.getPromedioCalificacion());
        dto.setTotalCalificaciones(o.getTotalCalificaciones());
        return dto;
    }

    public void updateEntity(Oficio oficio, OficioRequestDTO dto) {
        oficio.setEspecialidad(dto.getEspecialidad());
        oficio.setNombreServicio(dto.getNombreServicio());
        oficio.setDescripcionServicio(dto.getDescripcionServicio());
        oficio.setTarifaHora(dto.getTarifaHora());
        oficio.setTarifaServicioBase(dto.getTarifaServicioBase());
    }
}
