package com.weblocal.freelanceos.note.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Le frontend crée d'abord le projet normalement (POST /api/projects, avec le
 * titre/description pré-remplis depuis la note), puis appelle
 * PATCH /api/notes/{id}/convert avec l'id du projet obtenu, pour relier
 * après coup la note à ce projet.
 */
public record NoteConvertDto(
        @NotNull(message = "L'id du projet est obligatoire")
        Long projectId
) {
}
