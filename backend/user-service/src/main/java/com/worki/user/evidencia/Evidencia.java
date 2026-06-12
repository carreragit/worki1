package com.worki.user.evidencia;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "evidencias")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Evidencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long oficioId;

    @Column(length = 255)
    private String descripcion;

    @Column(nullable = false, length = 500)
    private String url;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
