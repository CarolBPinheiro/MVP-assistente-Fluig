package com.fortbras.fluig;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Aplicação principal do Fluig Assistente API
 * Backend para integração com banco de dados PostgreSQL da Fortbras
 * 
 * @author Caroline Pinheiro
 * @version 1.0.0
 */
@SpringBootApplication
public class FluigAssistenteApplication {

    public static void main(String[] args) {
        SpringApplication.run(FluigAssistenteApplication.class, args);
    }
}
