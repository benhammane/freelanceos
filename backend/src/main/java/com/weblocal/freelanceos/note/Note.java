package com.weblocal.freelanceos.note;

import com.weblocal.freelanceos.common.BaseEntity;
import com.weblocal.freelanceos.project.Project;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Note libre façon Notion : un espace de brouillon où l'on rédige en Markdown
 * AVANT qu'un projet n'existe (idée, cahier des charges informel, brief
 * client...). Une fois prête, la note est transformée en vrai Project (voir
 * NoteService.convertir) et reste reliée à lui pour garder la trace de son
 * origine — elle n'est jamais supprimée automatiquement.
 *
 * "project" est nullable et LAZY : une note peut rester libre indéfiniment
 * (jamais convertie), ou être liée après coup.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "notes")
public class Note extends BaseEntity {

    @Column(nullable = false)
    private String titre;

    /** Contenu Markdown brut, rendu tel quel côté frontend. */
    @Column(columnDefinition = "text")
    private String contenu;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;
}
