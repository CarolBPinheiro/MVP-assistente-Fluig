package com.fortbras.fluig.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Contexto do banco de dados para enriquecer o prompt da IA
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DatabaseContext {
    private List<UserProcess> userProcesses;
    private List<PendingTask> pendingTasks;
    
    public boolean hasData() {
        return (userProcesses != null && !userProcesses.isEmpty()) ||
               (pendingTasks != null && !pendingTasks.isEmpty());
    }
    
    /**
     * Converte o contexto para texto para incluir no prompt
     */
    public String toPromptText() {
        StringBuilder sb = new StringBuilder();
        
        if (userProcesses != null && !userProcesses.isEmpty()) {
            sb.append("\n\n## PROCESSOS DO USUÁRIO (dados em tempo real):\n");
            for (UserProcess p : userProcesses) {
                sb.append(String.format("- %s (ID: %s) - Status: %s - Criado em: %s%n",
                    p.getTitle(), p.getId(), p.getStatus(), p.getCreatedAt()));
            }
        }
        
        if (pendingTasks != null && !pendingTasks.isEmpty()) {
            sb.append("\n\n## TAREFAS PENDENTES DO USUÁRIO:\n");
            for (PendingTask t : pendingTasks) {
                sb.append(String.format("- %s (ID: %s) - Prazo: %s%n",
                    t.getDescription(), t.getId(), t.getDueDate()));
            }
        }
        
        return sb.toString();
    }
}
