package com.worki.user.perfil;

import com.worki.user.perfil.dto.PerfilRequestDTO;
import com.worki.user.perfil.dto.PerfilResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/perfiles")
@RequiredArgsConstructor
public class PerfilController {

    private final PerfilService perfilService;

    // POST /api/perfiles
    @PostMapping
    public ResponseEntity<PerfilResponseDTO> crear(@Valid @RequestBody PerfilRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(perfilService.crearPerfil(dto));
    }

    // GET /api/perfiles
    @GetMapping
    public ResponseEntity<List<PerfilResponseDTO>> obtenerTodos() {
        return ResponseEntity.ok(perfilService.obtenerTodos());
    }

    // GET /api/perfiles/{id}
    @GetMapping("/{id}")
    public ResponseEntity<PerfilResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(perfilService.obtenerPorId(id));
    }

    // GET /api/perfiles/usuario/{usuarioId}
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<PerfilResponseDTO> obtenerPorUsuarioId(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(perfilService.obtenerPorUsuarioId(usuarioId));
    }

    // PUT /api/perfiles/{id}
    @PutMapping("/{id}")
    public ResponseEntity<PerfilResponseDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody PerfilRequestDTO dto) {
        return ResponseEntity.ok(perfilService.actualizarPerfil(id, dto));
    }

    // DELETE /api/perfiles/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        perfilService.eliminarPerfil(id);
        return ResponseEntity.noContent().build();
    }
}
