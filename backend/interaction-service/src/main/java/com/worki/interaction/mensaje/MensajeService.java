package com.worki.interaction.mensaje;

import com.worki.interaction.mensaje.dto.EnviarMensajeRequest;
import com.worki.interaction.mensaje.dto.MensajeResponse;
import com.worki.interaction.solicitud.EstadoSolicitud;
import com.worki.interaction.solicitud.SolicitudRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class MensajeService {

    private final MensajeRepository mensajeRepository;
    private final SolicitudRepository solicitudRepository;
    private final RestTemplate restTemplate;

    @Value("${user-service.url}")
    private String userServiceUrl;

    // Guarda el mensaje y lo devuelve enriquecido con el nombre del remitente.
    // Valida que la solicitud esté ACEPTADA antes de permitir mensajes.
    public MensajeResponse guardarMensaje(Long solicitudId, EnviarMensajeRequest request) {
        // Solo se puede chatear en solicitudes activas (estado ACEPTADA)
        solicitudRepository.findById(solicitudId).ifPresent(s -> {
            if (s.getEstado() != EstadoSolicitud.ACEPTADA) {
                throw new IllegalStateException(
                    "El chat solo está disponible cuando la solicitud está ACEPTADA. Estado actual: " + s.getEstado());
            }
        });

        Mensaje mensaje = Mensaje.builder()
                .solicitudId(solicitudId)
                .remitenteId(request.getRemitenteId())
                .tipo(request.getTipo())
                .contenido(request.getContenido())
                .build();

        return toResponse(mensajeRepository.save(mensaje));
    }

    // Devuelve el historial completo del chat de una solicitud
    @Transactional(readOnly = true)
    public List<MensajeResponse> obtenerHistorial(Long solicitudId) {
        return mensajeRepository.findBySolicitudIdOrderByCreatedAtAsc(solicitudId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // Resuelve el nombre del remitente llamando al user-service internamente
    private String resolverNombre(Long usuarioId) {
        try {
            PerfilDto perfil = restTemplate.getForObject(
                userServiceUrl + "/internal/perfiles/usuario/" + usuarioId,
                PerfilDto.class
            );
            return perfil != null ? perfil.getNombreCompleto() : "Usuario #" + usuarioId;
        } catch (Exception e) {
            return "Usuario #" + usuarioId;
        }
    }

    private MensajeResponse toResponse(Mensaje m) {
        return MensajeResponse.builder()
                .id(m.getId())
                .solicitudId(m.getSolicitudId())
                .remitenteId(m.getRemitenteId())
                .nombreRemitente(resolverNombre(m.getRemitenteId()))
                .tipo(m.getTipo())
                .contenido(m.getContenido())
                .createdAt(m.getCreatedAt())
                .build();
    }

    // DTO interno para deserializar la respuesta del user-service
    @Data
    private static class PerfilDto {
        private Long id;
        private String nombreCompleto;
    }
}
