package com.worki.user.perfil;

import com.worki.user.perfil.dto.PerfilRequestDTO;
import com.worki.user.perfil.dto.PerfilResponseDTO;
import org.springframework.stereotype.Component;

@Component
public class PerfilMapper {

    public Perfil toEntity(PerfilRequestDTO dto) {
        return Perfil.builder()
                .usuarioId(dto.getUsuarioId())
                .nombreCompleto(dto.getNombreCompleto())
                .telefono(dto.getTelefono())
                .fotoPerfil(dto.getFotoPerfil())
                .descripcion(dto.getDescripcion())
                .fechaNacimiento(dto.getFechaNacimiento())
                .ciudad(dto.getCiudad())
                .region(dto.getRegion())
                .build();
    }

    public PerfilResponseDTO toDTO(Perfil perfil) {
        PerfilResponseDTO dto = new PerfilResponseDTO();
        dto.setId(perfil.getId());
        dto.setUsuarioId(perfil.getUsuarioId());
        dto.setNombreCompleto(perfil.getNombreCompleto());
        dto.setTelefono(perfil.getTelefono());
        dto.setFotoPerfil(perfil.getFotoPerfil());
        dto.setDescripcion(perfil.getDescripcion());
        dto.setFechaNacimiento(perfil.getFechaNacimiento());
        dto.setCiudad(perfil.getCiudad());
        dto.setRegion(perfil.getRegion());
        return dto;
    }

    public void updateEntity(Perfil perfil, PerfilRequestDTO dto) {
        perfil.setNombreCompleto(dto.getNombreCompleto());
        perfil.setTelefono(dto.getTelefono());
        perfil.setFotoPerfil(dto.getFotoPerfil());
        perfil.setDescripcion(dto.getDescripcion());
        perfil.setFechaNacimiento(dto.getFechaNacimiento());
        perfil.setCiudad(dto.getCiudad());
        perfil.setRegion(dto.getRegion());
    }
}
