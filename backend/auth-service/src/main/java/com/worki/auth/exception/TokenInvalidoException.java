package com.worki.auth.exception;

// RuntimeException: no obliga a declarar throws en los métodos que la lanzan
public class TokenInvalidoException extends RuntimeException {
    // El mensaje se pasa al GlobalExceptionHandler y se devuelve en el JSON de error
    public TokenInvalidoException(String mensaje) {
        super(mensaje);
    }
}
