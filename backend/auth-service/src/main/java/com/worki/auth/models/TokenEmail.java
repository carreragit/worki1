package com.worki.auth.models;

import com.worki.auth.models.enums.TipoToken;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "tokens_email")
@NoArgsConstructor
@AllArgsConstructor
public class TokenEmail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long idUsuario;

    @Column(nullable = false, unique = true)
    private String token;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoToken tipo;

    @Column(nullable = false)
    private LocalDateTime expira;

    @Column(nullable = false)
    private boolean usado = false;
}
