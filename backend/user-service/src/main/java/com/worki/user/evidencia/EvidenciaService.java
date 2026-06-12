package com.worki.user.evidencia;

import com.worki.user.evidencia.dto.EvidenciaResponseDTO;
import com.worki.user.oficio.OficioRepository;
import com.worki.user.perfil.PerfilRepository;
import com.worki.user.trabajador.TrabajadorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EvidenciaService {

    private static final long MAX_BYTES = 10L * 1024 * 1024; // 10MB
    private static final String UPLOADS_DIR = "uploads/";

    private final EvidenciaRepository evidenciaRepository;
    private final OficioRepository oficioRepository;
    private final TrabajadorRepository trabajadorRepository;
    private final PerfilRepository perfilRepository;

    public EvidenciaResponseDTO subir(Long oficioId, MultipartFile archivo, String descripcion) {
        if (archivo.getSize() > MAX_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La evidencia no puede superar 10MB");
        }

        String originalName = archivo.getOriginalFilename() != null ? archivo.getOriginalFilename() : "archivo";
        String nombreArchivo = UUID.randomUUID() + "_" + originalName;
        try {
            Files.createDirectories(Paths.get(UPLOADS_DIR));
            Files.copy(archivo.getInputStream(), Paths.get(UPLOADS_DIR + nombreArchivo), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error al guardar el archivo");
        }

        Evidencia evidencia = Evidencia.builder()
                .oficioId(oficioId)
                .descripcion(descripcion)
                .url("/uploads/" + nombreArchivo)
                .build();

        return toDTO(evidenciaRepository.save(evidencia));
    }

    public List<EvidenciaResponseDTO> listar(Long oficioId) {
        return evidenciaRepository.findByOficioId(oficioId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public void eliminar(Long oficioId, Long evidenciaId, Long usuarioId) {
        verificarPropiedad(oficioId, usuarioId);

        Evidencia evidencia = evidenciaRepository.findById(evidenciaId)
                .orElseThrow(() -> new RuntimeException("Evidencia no encontrada con id: " + evidenciaId));

        if (!evidencia.getOficioId().equals(oficioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Esta evidencia no pertenece al oficio indicado");
        }

        try {
            String rutaRelativa = evidencia.getUrl().replaceFirst("^/", "");
            Files.deleteIfExists(Paths.get(rutaRelativa));
        } catch (IOException ignored) {
        }

        evidenciaRepository.deleteById(evidenciaId);
    }

    private void verificarPropiedad(Long oficioId, Long usuarioId) {
        var oficio = oficioRepository.findById(oficioId)
                .orElseThrow(() -> new RuntimeException("Oficio no encontrado con id: " + oficioId));

        var perfil = perfilRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Sin permiso"));

        var trabajador = trabajadorRepository.findByPerfilId(perfil.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Sin permiso"));

        if (!oficio.getTrabajadorId().equals(trabajador.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tenés permiso para modificar este oficio");
        }
    }

    private EvidenciaResponseDTO toDTO(Evidencia e) {
        EvidenciaResponseDTO dto = new EvidenciaResponseDTO();
        dto.setId(e.getId());
        dto.setOficioId(e.getOficioId());
        dto.setDescripcion(e.getDescripcion());
        dto.setUrl(e.getUrl());
        dto.setCreatedAt(e.getCreatedAt());
        return dto;
    }
}
