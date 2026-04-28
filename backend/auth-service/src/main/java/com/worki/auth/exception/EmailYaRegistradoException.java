package com.worki.auth.exception;

// RuntimeException: no obliga a declarar throws en los métodos que la lanzan
public class EmailYaRegistradoException extends RuntimeException {
    // El mensaje se pasa al GlobalExceptionHandler y se devuelve en el JSON de error
    public EmailYaRegistradoException(String mensaje) {
        super(mensaje);
    }
}
