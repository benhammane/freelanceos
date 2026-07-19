package com.weblocal.freelanceos.task;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    /**
     * "ProjectId" dans le nom de la méthode navigue automatiquement la
     * relation @ManyToOne project -> id : Spring Data JPA génère
     * "SELECT * FROM tasks WHERE project_id = ? ORDER BY statut, position".
     */
    List<Task> findByProjectIdOrderByStatutAscPositionAsc(Long projectId);

    /**
     * Utilisé lors de la suppression d'un projet : ses tâches n'ont aucun
     * sens sans lui, on les supprime donc en cascade plutôt que de laisser
     * la contrainte de clé étrangère bloquer la suppression du projet.
     */
    void deleteByProjectId(Long projectId);
}
