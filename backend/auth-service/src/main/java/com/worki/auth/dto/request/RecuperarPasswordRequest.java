package com.worki.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

// Referencia: modelo Usuario
// El mapeo desde este DTO hacia Usuario lo realiza AuthService
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecuperarPasswordRequest {

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email no tiene formato válido")
    private String email;
}
