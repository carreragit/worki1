package com.worki.interaction.solicitud;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "solicitudes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Solicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** ID del cliente que envía la solicitud (referencia a user-service → Perfil) */
    @NotNull
    @Column(name = "cliente_id", nullable = false)
    private Long clienteId;

    /** ID del trabajador al que se le envía la solicitud (referencia a user-service → Trabajador) */
    @NotNull
    @Column(name = "trabajador_id", nullable = false)
    private Long trabajadorId;

    /**
     * ID del Oficio específico que el cliente está contratando (referencia a user-service → Oficio).
     * Define qué servicio puntual se solicita (ej: gasfitería de Juan, no plomería de Juan).
     * La Calificacion posterior quedará vinculada a este Oficio para mantener ratings por servicio.
     */
    @NotNull
    @Column(name = "oficio_id", nullable = false)
    private Long oficioId;

    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private EstadoSolicitud estado = EstadoSolicitud.PENDIENTE;

    /** Descripción del trabajo solicitado por el cliente */
    @Column(columnDefinition = "TEXT")
    private String descripcion;

    /**Fecha de creación de la solicitud */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**Fecha de actualización de la solicitud */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist //Se ejecuta antes de guardar la solicitud
    protected void onCreate() {
        createdAt = LocalDateTime.now(); //Fecha de creación de la solicitud
        updatedAt = LocalDateTime.now(); //Fecha de actualización de la solicitud
    }

    @PreUpdate //Se ejecuta antes de actualizar la solicitud
    protected void onUpdate() {
        updatedAt = LocalDateTime.now(); //Fecha de actualización de la solicitud
    }
}
