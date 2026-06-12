package com.worki.user.evidencia.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EvidenciaResponseDTO {
    private Long id;
    private Long oficioId;
    private String descripcion;
    private String url;
    private LocalDateTime createdAt;
}
