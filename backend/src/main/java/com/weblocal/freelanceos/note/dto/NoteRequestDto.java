package com.weblocal.freelanceos.note.dto;

import jakarta.validation.constraints.NotBlank;

public record NoteRequestDto(
        @NotBlank(message = "Le titre est obligatoire")
        String titre,

        String contenu
) {
}
