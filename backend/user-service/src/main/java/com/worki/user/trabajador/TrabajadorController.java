package com.worki.user.trabajador;

import com.worki.user.trabajador.dto.TrabajadorRequestDTO;
import com.worki.user.trabajador.dto.TrabajadorResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trabajadores")
@RequiredArgsConstructor
public class TrabajadorController {

    private final TrabajadorService trabajadorService;

    // POST /api/trabajadores
    @PostMapping
    public ResponseEntity<TrabajadorResponseDTO> registrar(@Valid @RequestBody TrabajadorRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(trabajadorService.registrarTrabajador(dto));
    }

    // GET /api/trabajadores
    @GetMapping
    public ResponseEntity<List<TrabajadorResponseDTO>> obtenerTodos() {
        return ResponseEntity.ok(trabajadorService.obtenerTodos());
    }

    // GET /api/trabajadores/{id}
    @GetMapping("/{id}")
    public ResponseEntity<TrabajadorResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(trabajadorService.obtenerPorId(id));
    }

    // GET /api/trabajadores/perfil/{perfilId}
    // El móvil lo usa para saber si el usuario autenticado tiene perfil de trabajador.
    // Si la respuesta es 404, el usuario es solo cliente.
    @GetMapping("/perfil/{perfilId}")
    public ResponseEntity<TrabajadorResponseDTO> obtenerPorPerfilId(@PathVariable Long perfilId) {
        return ResponseEntity.ok(trabajadorService.obtenerPorPerfilId(perfilId));
    }

    // PUT /api/trabajadores/{id}
    @PutMapping("/{id}")
    public ResponseEntity<TrabajadorResponseDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody TrabajadorRequestDTO dto) {
        return ResponseEntity.ok(trabajadorService.actualizarTrabajador(id, dto));
    }

    // DELETE /api/trabajadores/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        trabajadorService.eliminarTrabajador(id);
        return ResponseEntity.noContent().build();
    }
}
