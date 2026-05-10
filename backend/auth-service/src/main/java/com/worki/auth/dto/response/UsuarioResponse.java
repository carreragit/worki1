package com.worki.auth.dto.response;

import com.worki.auth.models.enums.Rol;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

// Referencia: modelo Usuario - expone solo los campos seguros (sin password)
// El mapeo desde Usuario hacia este DTO lo realiza AuthService
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioResponse {

    private Long id;
    private String email;
    private Rol rol;
    private boolean emailVerificado;
}
