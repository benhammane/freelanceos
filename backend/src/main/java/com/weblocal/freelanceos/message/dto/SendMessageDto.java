package com.weblocal.freelanceos.message.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Corps de requête pour l'envoi d'un message (admin ou client). */
public record SendMessageDto(
        @NotBlank @Size(max = 5000) String contenu
) {}
