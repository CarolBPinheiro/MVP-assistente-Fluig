package com.fortbras.fluig.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entidade que representa uma tarefa pendente no Fluig
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tasks")
public class PendingTask {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(name = "assignee_id", nullable = false)
    private String assigneeId;
    
    @Column(nullable = false)
    private String description;
    
    @Column(nullable = false)
    private String status;
    
    @Column(name = "due_date")
    private LocalDateTime dueDate;
    
    @Column(name = "process_id")
    private String processId;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = "pending";
        }
    }
}
