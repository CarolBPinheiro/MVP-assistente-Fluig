package com.fortbras.fluig.service;

import com.fortbras.fluig.exception.AIGatewayException;
import com.fortbras.fluig.model.ChatMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Serviço para comunicação com o AI Gateway (Lovable AI)
 */
@Slf4j
@Service
public class AIGatewayService {
    
    private static final String AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
    private static final String DEFAULT_MODEL = "google/gemini-3-flash-preview";
    
    private final WebClient webClient;
    
    @Value("${ai.gateway.api-key}")
    private String apiKey;
    
    @Value("${ai.gateway.model:" + DEFAULT_MODEL + "}")
    private String model;
    
    @Value("${ai.gateway.temperature:0.7}")
    private double temperature;
    
    @Value("${ai.gateway.max-tokens:2048}")
    private int maxTokens;
    
    public AIGatewayService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
                .baseUrl(AI_GATEWAY_URL)
                .build();
    }
    
    /**
     * Envia mensagens para o AI Gateway e retorna stream de respostas
     */
    public Flux<String> streamChat(List<ChatMessage> messages, String systemPrompt) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("stream", true);
        requestBody.put("temperature", temperature);
        requestBody.put("max_tokens", maxTokens);
        
        // Adiciona system prompt no início
        List<Map<String, String>> formattedMessages = new java.util.ArrayList<>();
        formattedMessages.add(Map.of("role", "system", "content", systemPrompt));
        
        for (ChatMessage msg : messages) {
            formattedMessages.add(Map.of("role", msg.getRole(), "content", msg.getContent()));
        }
        requestBody.put("messages", formattedMessages);
        
        log.info("Enviando {} mensagens para AI Gateway", messages.size());
        
        return webClient.post()
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(requestBody)
                .retrieve()
                .onStatus(status -> status.value() == HttpStatus.TOO_MANY_REQUESTS.value(),
                        response -> {
                            log.warn("Rate limit excedido no AI Gateway");
                            return response.bodyToMono(String.class)
                                    .map(body -> new AIGatewayException(
                                            "Limite de requisições excedido. Aguarde um momento.",
                                            HttpStatus.TOO_MANY_REQUESTS.value()));
                        })
                .onStatus(status -> status.value() == HttpStatus.PAYMENT_REQUIRED.value(),
                        response -> {
                            log.error("Créditos insuficientes no AI Gateway");
                            return response.bodyToMono(String.class)
                                    .map(body -> new AIGatewayException(
                                            "Créditos insuficientes. Contate o administrador.",
                                            HttpStatus.PAYMENT_REQUIRED.value()));
                        })
                .onStatus(HttpStatus.class::isError,
                        response -> {
                            log.error("Erro no AI Gateway: status={}", response.statusCode());
                            return response.bodyToMono(String.class)
                                    .map(body -> new AIGatewayException(
                                            "Erro ao processar solicitação: " + body,
                                            response.statusCode().value()));
                        })
                .bodyToFlux(String.class);
    }
}
