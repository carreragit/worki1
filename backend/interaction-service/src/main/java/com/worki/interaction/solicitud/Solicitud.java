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

    @NotNull
    @Column(name = "cliente_id", nullable = false)
    private Long clienteId;

    @NotNull
    @Column(name = "trabajador_id", nullable = false)
    private Long trabajadorId;

    // oficioId es opcional hasta que se implemente PerfilOficio (un trabajador puede tener múltiples oficios)
    @Column(name = "oficio_id")
    private Long oficioId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private EstadoSolicitud estado = EstadoSolicitud.PENDIENTE;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "fecha_hora_preferida")
    private LocalDateTime fechaHoraPreferida;

    @Column(name = "direccion", length = 300)
    private String direccion;

    @Column(name = "cliente_latitud")
    private Double clienteLatitud;

    @Column(name = "cliente_longitud")
    private Double clienteLongitud;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}