package com.weblocal.freelanceos.client.dto;

import java.time.LocalDateTime;

/**
 * DTO utilisé en SORTIE de l'API : ce que le frontend reçoit quand il
 * consulte un ou plusieurs clients. Contrairement au DTO d'entrée, celui-ci
 * inclut l'id et la date de création puisque le frontend en a besoin pour
 * afficher/identifier la ressource.
 */
public record ClientResponseDto(
        Long id,
        String nom,
        String email,
        String entreprise,
        String telephone,
        String adresse,
        String notes,
        LocalDateTime dateCreation
) {
}
