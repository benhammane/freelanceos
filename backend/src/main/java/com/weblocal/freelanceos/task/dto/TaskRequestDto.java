package com.weblocal.freelanceos.task.dto;

import com.weblocal.freelanceos.common.Priorite;
import com.weblocal.freelanceos.task.StatutTache;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record TaskRequestDto(
        @NotBlank(message = "Le titre est obligatoire")
        String titre,

        String description,

        @NotNull(message = "Le statut est obligatoire")
        StatutTache statut,

        @NotNull(message = "La priorité est obligatoire")
        Priorite priorite,

        @NotNull(message = "Le projet est obligatoire")
        Long projectId,

        int position,

        LocalDate dateEcheance
) {
}
