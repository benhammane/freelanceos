package com.weblocal.freelanceos.project.dto;

import com.weblocal.freelanceos.project.StatutProjet;
import jakarta.validation.constraints.NotNull;

/**
 * DTO utilisé uniquement pour le déplacement d'une carte dans le Kanban
 * (drag-and-drop) : quand une carte projet change de colonne et/ou de
 * position, le frontend envoie ce petit objet via PATCH plutôt que de
 * renvoyer le projet entier — on évite d'écraser des champs non concernés
 * par le déplacement.
 */
public record ProjectMoveDto(
        @NotNull(message = "Le statut est obligatoire")
        StatutProjet statut,

        int position
) {
}
