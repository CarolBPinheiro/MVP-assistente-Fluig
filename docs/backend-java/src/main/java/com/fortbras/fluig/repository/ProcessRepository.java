package com.fortbras.fluig.repository;

import com.fortbras.fluig.model.UserProcess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositório para acesso aos processos do Fluig
 */
@Repository
public interface ProcessRepository extends JpaRepository<UserProcess, String> {
    
    /**
     * Busca os processos mais recentes de um usuário
     */
    @Query("SELECT p FROM UserProcess p WHERE p.userId = :userId ORDER BY p.createdAt DESC")
    List<UserProcess> findByUserIdOrderByCreatedAtDesc(@Param("userId") String userId);
    
    /**
     * Busca processos por status
     */
    List<UserProcess> findByUserIdAndStatus(String userId, String status);
    
    /**
     * Busca os últimos N processos do usuário
     */
    @Query(value = "SELECT * FROM processes WHERE user_id = :userId ORDER BY created_at DESC LIMIT :limit", 
           nativeQuery = true)
    List<UserProcess> findTopNByUserId(@Param("userId") String userId, @Param("limit") int limit);
}
