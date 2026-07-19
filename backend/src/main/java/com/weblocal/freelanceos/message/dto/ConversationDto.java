package com.weblocal.freelanceos.message.dto;

import java.time.LocalDateTime;

/**
 * Résumé d'une conversation pour la liste côté admin : un client, son dernier
 * message et le nombre de messages non lus (envoyés par le client).
 */
public record ConversationDto(
        Long clientId,
        String clientNom,
        String dernierMessage,
        LocalDateTime dernierAt,
        long nonLus
) {}
