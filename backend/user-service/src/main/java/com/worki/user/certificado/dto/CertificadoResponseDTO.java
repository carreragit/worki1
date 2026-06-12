package com.worki.user.certificado.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CertificadoResponseDTO {
    private Long id;
    private Long oficioId;
    private String nombre;
    private String url;
    private LocalDateTime createdAt;
}
