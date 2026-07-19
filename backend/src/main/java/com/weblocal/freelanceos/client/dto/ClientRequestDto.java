package com.weblocal.freelanceos.client.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO (Data Transfer Object) utilisé en ENTRÉE de l'API (création/modification
 * d'un client via POST/PUT).
 *
 * Pourquoi ne jamais exposer directement l'entité Client dans les contrôleurs ?
 *   1. Sécurité : l'entité peut contenir des champs qu'on ne veut pas laisser
 *      modifier par le client de l'API (id, dates d'audit...).
 *   2. Découplage : la structure de la base de données peut évoluer sans casser
 *      le contrat de l'API, et inversement.
 *   3. Validation : les DTO d'entrée portent les annotations Bean Validation
 *      (@NotBlank, @Email...) qui n'ont de sens que pour des données reçues
 *      de l'extérieur, pas pour l'entité elle-même.
 *
 * On utilise un "record" Java (immuable, concis) plutôt qu'une classe classique.
 */
public record ClientRequestDto(
        @NotBlank(message = "Le nom est obligatoire")
        String nom,

        @NotBlank(message = "L'email est obligatoire")
        @Email(message = "L'email doit être valide")
        String email,

        String entreprise,

        String telephone,

        String adresse,

        String notes
) {
}
