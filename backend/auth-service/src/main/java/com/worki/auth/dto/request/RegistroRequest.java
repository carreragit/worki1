package com.worki.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

// Referencia: modelo Usuario + modelo Referido (si viene codigoReferido)
// El mapeo desde este DTO hacia los modelos lo realiza AuthService
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistroRequest {

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email no tiene formato válido")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    private String password;

    // opcional - código de referido de otro usuario
    private String codigoReferido;
}
