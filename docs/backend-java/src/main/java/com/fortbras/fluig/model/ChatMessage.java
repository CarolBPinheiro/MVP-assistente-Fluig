package com.fortbras.fluig.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * Representa uma mensagem no chat
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    
    @NotBlank(message = "Role é obrigatório")
    @Pattern(regexp = "^(user|assistant|system)$", message = "Role deve ser 'user', 'assistant' ou 'system'")
    private String role;
    
    @NotBlank(message = "Content é obrigatório")
    private String content;
}
