package com.weblocal.freelanceos.note.dto;

import java.time.LocalDateTime;

/**
 * projectId/projectTitre sont non-null seulement si la note a déjà été
 * convertie en projet (voir NoteService.convertir) : le frontend s'en sert
 * pour afficher un badge "→ Projet" et proposer un lien direct.
 */
public record NoteResponseDto(
        Long id,
        String titre,
        String contenu,
        LocalDateTime dateCreation,
        LocalDateTime dateModification,
        Long projectId,
        String projectTitre
) {
}
