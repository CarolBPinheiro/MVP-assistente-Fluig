package com.fortbras.fluig.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

/**
 * Configuração de CORS para permitir requisições do frontend
 */
@Configuration
public class CorsConfig {

    @Value("${cors.allowed-origins:*}")
    private String[] allowedOrigins;

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        
        // Origens permitidas
        if (allowedOrigins.length == 1 && "*".equals(allowedOrigins[0])) {
            config.addAllowedOriginPattern("*");
        } else {
            config.setAllowedOrigins(Arrays.asList(allowedOrigins));
        }
        
        // Headers permitidos
        config.setAllowedHeaders(List.of(
            "Authorization",
            "Content-Type",
            "X-Client-Info",
            "apikey"
        ));
        
        // Métodos permitidos
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // Permitir credentials
        config.setAllowCredentials(true);
        
        // Tempo de cache do preflight
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        
        return new CorsFilter(source);
    }
}
