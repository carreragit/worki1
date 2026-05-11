package com.worki.user.perfil;

import com.worki.user.perfil.dto.PerfilRequestDTO;
import com.worki.user.perfil.dto.PerfilResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PerfilService {

    private final PerfilRepository perfilRepository;
    private final PerfilMapper perfilMapper;

    // Crear un perfil (solo si el usuario no tiene ya uno)
    public PerfilResponseDTO crearPerfil(PerfilRequestDTO dto) {
        if (perfilRepository.existsByUsuarioId(dto.getUsuarioId())) {
            throw new IllegalStateException("El usuario con id " + dto.getUsuarioId() + " ya tiene un perfil.");
        }
        Perfil perfil = perfilMapper.toEntity(dto);
        return perfilMapper.toDTO(perfilRepository.save(perfil));
    }

    // Obtener todos los perfiles
    public List<PerfilResponseDTO> obtenerTodos() {
        return perfilRepository.findAll()
                .stream()
                .map(perfilMapper::toDTO)
                .collect(Collectors.toList());
    }

    // Obtener perfil por ID interno
    public PerfilResponseDTO obtenerPorId(Long id) {
        Perfil perfil = perfilRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Perfil no encontrado con id: " + id));
        return perfilMapper.toDTO(perfil);
    }

    // Obtener perfil por usuarioId (viene del auth-service)
    public PerfilResponseDTO obtenerPorUsuarioId(Long usuarioId) {
        Perfil perfil = perfilRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RuntimeException("Perfil no encontrado para usuarioId: " + usuarioId));
        return perfilMapper.toDTO(perfil);
    }

    // Actualizar perfil
    public PerfilResponseDTO actualizarPerfil(Long id, PerfilRequestDTO dto) {
        Perfil perfil = perfilRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Perfil no encontrado con id: " + id));
        perfilMapper.updateEntity(perfil, dto);
        return perfilMapper.toDTO(perfilRepository.save(perfil));
    }

    // Eliminar perfil
    public void eliminarPerfil(Long id) {
        if (!perfilRepository.existsById(id)) {
            throw new RuntimeException("Perfil no encontrado con id: " + id);
        }
        perfilRepository.deleteById(id);
    }
}
