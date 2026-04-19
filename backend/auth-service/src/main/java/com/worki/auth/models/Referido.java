package com.worki.auth.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "referidos")
@NoArgsConstructor
@AllArgsConstructor
public class Referido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long idReferidor;

    @Column(nullable = false, unique = true)
    private Long idReferido;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime fechaCreacion;
}
