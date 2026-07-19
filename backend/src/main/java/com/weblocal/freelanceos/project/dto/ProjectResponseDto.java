package com.weblocal.freelanceos.project.dto;

import com.weblocal.freelanceos.common.Priorite;
import com.weblocal.freelanceos.project.StatutProjet;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO de sortie pour un projet. On inclut le nom du client directement
 * (clientNom) en plus de son id : ça évite au frontend de devoir faire un
 * second appel API juste pour afficher le nom du client sur une carte Kanban.
 */
public record ProjectResponseDto(
        Long id,
        String titre,
        String description,
        String url,
        StatutProjet statut,
        Priorite priorite,
        Long clientId,
        String clientNom,
        List<String> technos,
        LocalDate dateDebut,
        LocalDate dateFinPrevue,
        BigDecimal montantEstime,
        int position,
        List<ScreenshotDto> screenshots
) {
}
