package com.weblocal.freelanceos.task.dto;

import com.weblocal.freelanceos.task.StatutTache;
import jakarta.validation.constraints.NotNull;

public record TaskMoveDto(
        @NotNull(message = "Le statut est obligatoire")
        StatutTache statut,

        int position
) {
}
