package com.worki.interaction.mensaje;

import com.worki.interaction.mensaje.dto.EnviarMensajeRequest;
import com.worki.interaction.mensaje.dto.MensajeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@RestController
@RequiredArgsConstructor
public class MensajeController {

    private final MensajeService mensajeService;

    // ── WEBSOCKET ─────────────────────────────────────────────────────────────

    // Recibe mensajes en /app/chat/{solicitudId} y los brodcastea a /topic/chat/{solicitudId}
    // Todos los suscriptores del topic (cliente y trabajador) reciben el mensaje en tiempo real
    @MessageMapping("/chat/{solicitudId}")
    @SendTo("/topic/chat/{solicitudId}")
    public MensajeResponse enviarMensaje(
            @DestinationVariable Long solicitudId,
            @Payload EnviarMensajeRequest request,
            SimpMessageHeaderAccessor headerAccessor) {

        Long userId = (Long) headerAccessor.getSessionAttributes().get("userId");
        request.setRemitenteId(userId);
        return mensajeService.guardarMensaje(solicitudId, request);
    }

    // ── REST ──────────────────────────────────────────────────────────────────

    // Carga el historial de mensajes al abrir el chat
    @GetMapping("/api/interacciones/mensajes/{solicitudId}")
    public ResponseEntity<List<MensajeResponse>> historial(@PathVariable Long solicitudId) {
        return ResponseEntity.ok(mensajeService.obtenerHistorial(solicitudId));
    }

    // Sube una imagen al servidor y devuelve la URL para enviarla como mensaje
    @PostMapping("/api/interacciones/mensajes/imagen")
    public ResponseEntity<Map<String, String>> subirImagen(
            @RequestParam("imagen") MultipartFile file) throws IOException {

        // Guardar en uploads/ con nombre único para evitar colisiones
        String uploadsDir = "uploads/";
        Files.createDirectories(Paths.get(uploadsDir));
        String nombreArchivo = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path destino = Paths.get(uploadsDir + nombreArchivo);
        Files.copy(file.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);

        // La URL es la ruta pública que el cliente usará para cargar la imagen
        String url = "/uploads/" + nombreArchivo;
        return ResponseEntity.ok(Map.of("url", url));
    }
}
