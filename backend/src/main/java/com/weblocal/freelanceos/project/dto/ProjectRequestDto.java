package com.weblocal.freelanceos.project.dto;

import com.weblocal.freelanceos.common.Priorite;
import com.weblocal.freelanceos.project.StatutProjet;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO d'entrée pour créer/modifier un projet.
 * On ne reçoit que l'id du client (clientId), jamais l'objet Client complet :
 * c'est au service de charger l'entité Client correspondante en base.
 */
public record ProjectRequestDto(
        @NotBlank(message = "Le titre est obligatoire")
        String titre,

        String description,

        String url,

        @NotNull(message = "Le statut est obligatoire")
        StatutProjet statut,

        @NotNull(message = "La priorité est obligatoire")
        Priorite priorite,

        @NotNull(message = "Le client est obligatoire")
        Long clientId,

        List<String> technos,

        LocalDate dateDebut,

        LocalDate dateFinPrevue,

        BigDecimal montantEstime,

        int position
) {
}
