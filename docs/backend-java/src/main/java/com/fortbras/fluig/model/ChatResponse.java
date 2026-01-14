package com.fortbras.fluig.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Resposta do chat (para respostas não-streaming)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {
    private String content;
    private String error;
    private boolean success;
    
    public static ChatResponse success(String content) {
        return ChatResponse.builder()
                .content(content)
                .success(true)
                .build();
    }
    
    public static ChatResponse error(String errorMessage) {
        return ChatResponse.builder()
                .error(errorMessage)
                .success(false)
                .build();
    }
}
