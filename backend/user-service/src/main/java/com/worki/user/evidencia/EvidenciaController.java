package com.worki.user.evidencia;

import com.worki.user.evidencia.dto.EvidenciaResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/oficios/{oficioId}/evidencias")
@RequiredArgsConstructor
public class EvidenciaController {

    private final EvidenciaService evidenciaService;

    @PostMapping
    public ResponseEntity<EvidenciaResponseDTO> subir(
            @PathVariable Long oficioId,
            @RequestParam("archivo") MultipartFile archivo,
            @RequestParam(value = "descripcion", required = false) String descripcion) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(evidenciaService.subir(oficioId, archivo, descripcion));
    }

    @GetMapping
    public ResponseEntity<List<EvidenciaResponseDTO>> listar(@PathVariable Long oficioId) {
        return ResponseEntity.ok(evidenciaService.listar(oficioId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long oficioId,
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long usuarioId) {
        evidenciaService.eliminar(oficioId, id, usuarioId);
        return ResponseEntity.noContent().build();
    }
}
