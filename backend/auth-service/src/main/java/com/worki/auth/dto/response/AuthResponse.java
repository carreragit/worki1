package com.worki.auth.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

// Referencia: no mapea un modelo, contiene solo el JWT generado por JwtService
// AuthService genera el token y lo coloca aqui antes de devolver al controller
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;
}
