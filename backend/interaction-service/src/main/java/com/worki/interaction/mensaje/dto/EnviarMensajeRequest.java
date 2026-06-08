package com.worki.interaction.mensaje.dto;

import com.worki.interaction.mensaje.TipoMensaje;
import lombok.Data;

// Payload que el cliente envía por WebSocket para mandar un mensaje
@Data
public class EnviarMensajeRequest {
    private Long remitenteId;
    private TipoMensaje tipo;
    private String contenido;
}
