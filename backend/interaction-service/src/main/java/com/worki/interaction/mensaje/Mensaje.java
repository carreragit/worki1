package com.worki.interaction.mensaje;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

// Representa un mensaje del chat vinculado a una solicitud aceptada.
// El chat solo existe mientras la solicitud está activa.
@Entity
@Table(name = "mensajes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mensaje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Solicitud a la que pertenece este mensaje — el chat es por solicitud
    @Column(name = "solicitud_id", nullable = false)
    private Long solicitudId;

    // Quién envió el mensaje (clienteId o trabajadorId del auth-service)
    @Column(name = "remitente_id", nullable = false)
    private Long remitenteId;

    // TEXTO: contenido es el texto; IMAGEN: contenido es la URL de la imagen
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TipoMensaje tipo;

    // Texto del mensaje o URL de la imagen subida
    @Column(columnDefinition = "TEXT")
    private String contenido;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
