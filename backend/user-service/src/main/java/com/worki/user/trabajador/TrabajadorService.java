package com.worki.user.trabajador;

import com.worki.user.trabajador.dto.TrabajadorRequestDTO;
import com.worki.user.trabajador.dto.TrabajadorResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrabajadorService {

    private final TrabajadorRepository trabajadorRepository;
    private final TrabajadorMapper trabajadorMapper;

    // Registrar trabajador (vinculado a un Perfil existente)
    public TrabajadorResponseDTO registrarTrabajador(TrabajadorRequestDTO dto) {
        if (trabajadorRepository.findByPerfilId(dto.getPerfilId()).isPresent()) {
            throw new IllegalStateException("El perfil " + dto.getPerfilId() + " ya está registrado como trabajador.");
        }
        Trabajador trabajador = trabajadorMapper.toEntity(dto);
        return trabajadorMapper.toDTO(trabajadorRepository.save(trabajador));
    }

    // Obtener todos los trabajadores
    public List<TrabajadorResponseDTO> obtenerTodos() {
        return trabajadorRepository.findAll()
                .stream()
                .map(trabajadorMapper::toDTO)
                .collect(Collectors.toList());
    }

    // Obtener trabajador por ID
    public TrabajadorResponseDTO obtenerPorId(Long id) {
        Trabajador t = trabajadorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trabajador no encontrado con id: " + id));
        return trabajadorMapper.toDTO(t);
    }

    // Actualizar datos del trabajador
    public TrabajadorResponseDTO actualizarTrabajador(Long id, TrabajadorRequestDTO dto) {
        Trabajador t = trabajadorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trabajador no encontrado con id: " + id));
        trabajadorMapper.updateEntity(t, dto);
        return trabajadorMapper.toDTO(trabajadorRepository.save(t));
    }

    // Eliminar trabajador
    public void eliminarTrabajador(Long id) {
        if (!trabajadorRepository.existsById(id)) {
            throw new RuntimeException("Trabajador no encontrado con id: " + id);
        }
        trabajadorRepository.deleteById(id);
    }

    // Obtener trabajador por perfilId
    public TrabajadorResponseDTO obtenerPorPerfilId(Long perfilId) {
        Trabajador t = trabajadorRepository.findByPerfilId(perfilId)
                .orElseThrow(() -> new RuntimeException("No existe trabajador para perfilId: " + perfilId));
        return trabajadorMapper.toDTO(t);
    }
}
