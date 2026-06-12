package com.worki.user.certificado;

import com.worki.user.certificado.dto.CertificadoResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/oficios/{oficioId}/certificados")
@RequiredArgsConstructor
public class CertificadoController {

    private final CertificadoService certificadoService;

    @PostMapping
    public ResponseEntity<CertificadoResponseDTO> subir(
            @PathVariable Long oficioId,
            @RequestParam("archivo") MultipartFile archivo,
            @RequestParam("nombre") String nombre) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(certificadoService.subir(oficioId, archivo, nombre));
    }

    @GetMapping
    public ResponseEntity<List<CertificadoResponseDTO>> listar(@PathVariable Long oficioId) {
        return ResponseEntity.ok(certificadoService.listar(oficioId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long oficioId,
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long usuarioId) {
        certificadoService.eliminar(oficioId, id, usuarioId);
        return ResponseEntity.noContent().build();
    }
}
