package com.worki.user.oficio;

import com.worki.user.oficio.dto.OficioRequestDTO;
import com.worki.user.oficio.dto.OficioResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/oficios")
@RequiredArgsConstructor
public class OficioController {

    private final OficioService oficioService;

    // POST /api/oficios
    @PostMapping
    public ResponseEntity<OficioResponseDTO> crear(@Valid @RequestBody OficioRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(oficioService.crear(dto));
    }

    // GET /api/oficios
    @GetMapping
    public ResponseEntity<List<OficioResponseDTO>> obtenerTodos() {
        return ResponseEntity.ok(oficioService.obtenerTodos());
    }

    // GET /api/oficios/{id}
    @GetMapping("/{id}")
    public ResponseEntity<OficioResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(oficioService.obtenerPorId(id));
    }

    // GET /api/oficios/trabajador/{trabajadorId}
    @GetMapping("/trabajador/{trabajadorId}")
    public ResponseEntity<List<OficioResponseDTO>> obtenerPorTrabajador(@PathVariable Long trabajadorId) {
        return ResponseEntity.ok(oficioService.obtenerPorTrabajador(trabajadorId));
    }

    // GET /api/oficios/buscar?especialidad=electricista
    @GetMapping("/buscar")
    public ResponseEntity<List<OficioResponseDTO>> buscarPorEspecialidad(@RequestParam String especialidad) {
        return ResponseEntity.ok(oficioService.buscarPorEspecialidad(especialidad));
    }

    // GET /api/oficios/mapa?latitud=-33.45&longitud=-70.65&especialidad=electricista
    // latitud y longitud son la posicion del cliente.
    // radioKm (opcional) acota la busqueda; si no viene, manda solo el radio del trabajador.
    // especialidad es opcional. Los resultados vienen ordenados del mas cercano al mas lejano.
    @GetMapping("/mapa")
    public ResponseEntity<List<OficioResponseDTO>> obtenerParaMapa(
            @RequestParam Double latitud,
            @RequestParam Double longitud,
            @RequestParam(required = false) Double radioKm,
            @RequestParam(required = false) String especialidad) {
        return ResponseEntity.ok(oficioService.obtenerParaMapa(latitud, longitud, radioKm, especialidad));
    }

    // PATCH /api/oficios/{id}/activo?valor=false
    @PatchMapping("/{id}/activo")
    public ResponseEntity<OficioResponseDTO> cambiarActivo(
            @PathVariable Long id,
            @RequestParam boolean valor) {
        return ResponseEntity.ok(oficioService.cambiarActivo(id, valor));
    }

    // PATCH /api/oficios/trabajador/{trabajadorId}/desactivar-todos
    @PatchMapping("/trabajador/{trabajadorId}/desactivar-todos")
    public ResponseEntity<Void> desactivarTodos(@PathVariable Long trabajadorId) {
        oficioService.desactivarTodos(trabajadorId);
        return ResponseEntity.noContent().build();
    }

    // PUT /api/oficios/{id}
    @PutMapping("/{id}")
    public ResponseEntity<OficioResponseDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody OficioRequestDTO dto) {
        return ResponseEntity.ok(oficioService.actualizar(id, dto));
    }

    // DELETE /api/oficios/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        oficioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
