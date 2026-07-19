package com.weblocal.freelanceos.message.dto;

import com.weblocal.freelanceos.auth.Role;

import java.time.LocalDateTime;

/** Un message tel qu'exposé au frontend. */
public record MessageDto(
        Long id,
        Long clientId,
        Role senderRole,
        String contenu,
        LocalDateTime dateCreation,
        boolean lu
) {}
