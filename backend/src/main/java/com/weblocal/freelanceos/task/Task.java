package com.weblocal.freelanceos.task;

import com.weblocal.freelanceos.common.BaseEntity;
import com.weblocal.freelanceos.common.Priorite;
import com.weblocal.freelanceos.project.Project;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Entité JPA représentant une sous-tâche d'un projet.
 * Même structure que Project (statut + priorite + position pour le Kanban),
 * mais rattachée à un Project plutôt qu'à un Client.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "tasks")
public class Task extends BaseEntity {

    @Column(nullable = false)
    private String titre;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutTache statut;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priorite priorite;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false)
    private int position;

    private LocalDate dateEcheance;
}
