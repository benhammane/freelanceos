package com.weblocal.freelanceos.task.dto;

import com.weblocal.freelanceos.common.Priorite;
import com.weblocal.freelanceos.task.StatutTache;

import java.time.LocalDate;

public record TaskResponseDto(
        Long id,
        String titre,
        String description,
        StatutTache statut,
        Priorite priorite,
        Long projectId,
        int position,
        LocalDate dateEcheance
) {
}
