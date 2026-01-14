package com.fortbras.fluig.exception;

import lombok.Getter;

/**
 * Exceção para erros do AI Gateway
 */
@Getter
public class AIGatewayException extends RuntimeException {
    
    private final int statusCode;
    
    public AIGatewayException(String message, int statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
    
    public AIGatewayException(String message, int statusCode, Throwable cause) {
        super(message, cause);
        this.statusCode = statusCode;
    }
}
