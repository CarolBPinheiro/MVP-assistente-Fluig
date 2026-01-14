package com.fortbras.fluig.service;

import com.fortbras.fluig.model.DatabaseContext;
import com.fortbras.fluig.model.PendingTask;
import com.fortbras.fluig.model.UserProcess;
import com.fortbras.fluig.repository.ProcessRepository;
import com.fortbras.fluig.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

/**
 * Serviço para buscar contexto do banco de dados
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DatabaseContextService {
    
    private static final int MAX_PROCESSES = 10;
    private static final int MAX_TASKS = 5;
    
    private final ProcessRepository processRepository;
    private final TaskRepository taskRepository;
    
    /**
     * Busca o contexto completo do usuário no banco de dados
     */
    public DatabaseContext fetchContext(String userId) {
        if (userId == null || userId.isBlank()) {
            log.debug("userId não fornecido, retornando contexto vazio");
            return DatabaseContext.builder()
                    .userProcesses(Collections.emptyList())
                    .pendingTasks(Collections.emptyList())
                    .build();
        }
        
        try {
            List<UserProcess> processes = processRepository.findTopNByUserId(userId, MAX_PROCESSES);
            List<PendingTask> tasks = taskRepository.findTopNPendingByAssigneeId(userId, MAX_TASKS);
            
            log.info("Contexto carregado para userId={}: {} processos, {} tarefas", 
                    userId, processes.size(), tasks.size());
            
            return DatabaseContext.builder()
                    .userProcesses(processes)
                    .pendingTasks(tasks)
                    .build();
                    
        } catch (Exception e) {
            log.error("Erro ao buscar contexto do banco para userId={}: {}", userId, e.getMessage());
            return DatabaseContext.builder()
                    .userProcesses(Collections.emptyList())
                    .pendingTasks(Collections.emptyList())
                    .build();
        }
    }
}
