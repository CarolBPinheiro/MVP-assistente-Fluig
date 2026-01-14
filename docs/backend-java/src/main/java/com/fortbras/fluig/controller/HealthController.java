package com.fortbras.fluig.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller para health checks
 */
@Slf4j
@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class HealthController {
    
    private final DataSource dataSource;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "fluig-assistente-api");
        health.put("version", "1.0.0");
        
        // Verificar conexão com banco
        try (Connection conn = dataSource.getConnection()) {
            health.put("database", conn.isValid(5) ? "UP" : "DOWN");
        } catch (Exception e) {
            log.warn("Falha ao verificar conexão com banco: {}", e.getMessage());
            health.put("database", "DOWN");
            health.put("database_error", e.getMessage());
        }
        
        return ResponseEntity.ok(health);
    }
    
    @GetMapping("/live")
    public ResponseEntity<Map<String, String>> liveness() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }
    
    @GetMapping("/ready")
    public ResponseEntity<Map<String, String>> readiness() {
        try (Connection conn = dataSource.getConnection()) {
            if (conn.isValid(5)) {
                return ResponseEntity.ok(Map.of("status", "READY"));
            }
        } catch (Exception e) {
            log.error("Readiness check failed: {}", e.getMessage());
        }
        return ResponseEntity.status(503).body(Map.of("status", "NOT_READY"));
    }
}
