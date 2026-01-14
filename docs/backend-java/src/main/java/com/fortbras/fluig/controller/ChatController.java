package com.fortbras.fluig.controller;

import com.fortbras.fluig.model.ChatRequest;
import com.fortbras.fluig.model.DatabaseContext;
import com.fortbras.fluig.service.ChatService;
import com.fortbras.fluig.service.DatabaseContextService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

/**
 * Controller para endpoints de chat
 */
@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ChatController {
    
    private final ChatService chatService;
    private final DatabaseContextService databaseContextService;
    
    /**
     * Endpoint principal de chat com streaming SSE
     */
    @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> chat(@Valid @RequestBody ChatRequest request) {
        log.info("Recebida requisição de chat com {} mensagens", request.getMessages().size());
        return chatService.processChat(request);
    }
    
    /**
     * Endpoint para buscar contexto do usuário (para debug/testing)
     */
    @GetMapping("/context/{userId}")
    public ResponseEntity<DatabaseContext> getContext(@PathVariable String userId) {
        log.info("Buscando contexto para userId={}", userId);
        DatabaseContext context = databaseContextService.fetchContext(userId);
        return ResponseEntity.ok(context);
    }
}
