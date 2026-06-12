package com.worki.user.certificado;

import com.worki.user.certificado.dto.CertificadoResponseDTO;
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
public class CertificadoService {

    private static final long MAX_BYTES = 5L * 1024 * 1024; // 5MB
    private static final String UPLOADS_DIR = "uploads/";

    private final CertificadoRepository certificadoRepository;
    private final OficioRepository oficioRepository;
    private final TrabajadorRepository trabajadorRepository;
    private final PerfilRepository perfilRepository;

    public CertificadoResponseDTO subir(Long oficioId, MultipartFile archivo, String nombre) throws IOException {
        if (archivo.getSize() > MAX_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El certificado no puede superar 5MB");
        }

        Files.createDirectories(Paths.get(UPLOADS_DIR));
        String nombreArchivo = UUID.randomUUID() + "_" + archivo.getOriginalFilename();
        Files.copy(archivo.getInputStream(), Paths.get(UPLOADS_DIR + nombreArchivo), StandardCopyOption.REPLACE_EXISTING);

        Certificado certificado = Certificado.builder()
                .oficioId(oficioId)
                .nombre(nombre)
                .url("/uploads/" + nombreArchivo)
                .build();

        return toDTO(certificadoRepository.save(certificado));
    }

    public List<CertificadoResponseDTO> listar(Long oficioId) {
        return certificadoRepository.findByOficioId(oficioId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public void eliminar(Long oficioId, Long certificadoId, Long usuarioId) {
        verificarPropiedad(oficioId, usuarioId);

        Certificado certificado = certificadoRepository.findById(certificadoId)
                .orElseThrow(() -> new RuntimeException("Certificado no encontrado con id: " + certificadoId));

        try {
            String rutaRelativa = certificado.getUrl().replaceFirst("^/", "");
            Files.deleteIfExists(Paths.get(rutaRelativa));
        } catch (IOException ignored) {
        }

        certificadoRepository.deleteById(certificadoId);
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

    private CertificadoResponseDTO toDTO(Certificado c) {
        CertificadoResponseDTO dto = new CertificadoResponseDTO();
        dto.setId(c.getId());
        dto.setOficioId(c.getOficioId());
        dto.setNombre(c.getNombre());
        dto.setUrl(c.getUrl());
        dto.setCreatedAt(c.getCreatedAt());
        return dto;
    }
}
