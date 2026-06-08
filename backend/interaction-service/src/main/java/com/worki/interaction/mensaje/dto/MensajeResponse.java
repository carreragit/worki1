package com.worki.interaction.mensaje.dto;

import com.worki.interaction.mensaje.TipoMensaje;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

// Respuesta enviada a los suscriptores del topic y al cargar el historial
@Data
@Builder
public class MensajeResponse {
    private Long id;
    private Long solicitudId;
    private Long remitenteId;
    private String nombreRemitente;
    private TipoMensaje tipo;
    private String contenido;
    private LocalDateTime createdAt;
}
