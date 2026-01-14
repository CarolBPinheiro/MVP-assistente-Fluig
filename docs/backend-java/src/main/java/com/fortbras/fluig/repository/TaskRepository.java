package com.fortbras.fluig.repository;

import com.fortbras.fluig.model.PendingTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositório para acesso às tarefas do Fluig
 */
@Repository
public interface TaskRepository extends JpaRepository<PendingTask, String> {
    
    /**
     * Busca tarefas pendentes de um usuário ordenadas por prazo
     */
    @Query("SELECT t FROM PendingTask t WHERE t.assigneeId = :assigneeId AND t.status = 'pending' ORDER BY t.dueDate ASC")
    List<PendingTask> findPendingByAssigneeId(@Param("assigneeId") String assigneeId);
    
    /**
     * Busca todas as tarefas de um usuário
     */
    List<PendingTask> findByAssigneeIdOrderByDueDateAsc(String assigneeId);
    
    /**
     * Busca as próximas N tarefas pendentes
     */
    @Query(value = "SELECT * FROM tasks WHERE assignee_id = :assigneeId AND status = 'pending' ORDER BY due_date ASC LIMIT :limit", 
           nativeQuery = true)
    List<PendingTask> findTopNPendingByAssigneeId(@Param("assigneeId") String assigneeId, @Param("limit") int limit);
    
    /**
     * Conta tarefas pendentes
     */
    long countByAssigneeIdAndStatus(String assigneeId, String status);
}
