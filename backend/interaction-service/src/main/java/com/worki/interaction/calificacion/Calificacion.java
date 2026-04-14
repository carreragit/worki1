package com.worki.interaction.calificacion;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "calificaciones",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_calificacion_solicitud_evaluador",
        columnNames = {"solicitud_id", "evaluador_id"}
    )
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Calificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** La solicitud completada sobre la que se califica */
    @NotNull
    @Column(name = "solicitud_id", nullable = false)
    private Long solicitudId;

    /**
     * ID del Oficio calificado (referencia a user-service → Oficio).
     * Permite recalcular la calificación promedio de ese oficio específico
     * sin afectar otros oficios del mismo trabajador.
     */
    @NotNull
    @Column(name = "oficio_id", nullable = false)
    private Long oficioId;

    /** Quién emite la calificación (cliente o trabajador) */
    @NotNull
    @Column(name = "evaluador_id", nullable = false)
    private Long evaluadorId;

    /** Quién recibe la calificación */
    @NotNull
    @Column(name = "evaluado_id", nullable = false)
    private Long evaluadoId;

    /**
     * Puntaje de 1 a 5 estrellas.
     */
    @NotNull
    @Min(1)
    @Max(5)
    @Column(nullable = false)
    private Integer puntaje;

    /** Comentario opcional sobre el trabajo o el cliente */
    @Size(max = 1000)
    @Column(columnDefinition = "TEXT")
    private String comentario;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
