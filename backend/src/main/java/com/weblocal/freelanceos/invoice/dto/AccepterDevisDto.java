package com.weblocal.freelanceos.invoice.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Corps de requête pour l'acceptation en ligne d'un devis par un client.
 * consentement doit valoir true (case cochée) pour que l'acceptation soit valide.
 */
public record AccepterDevisDto(
        @NotBlank @Size(max = 120) String signataireNom,
        @AssertTrue(message = "Vous devez accepter les conditions pour valider le devis") boolean consentement
) {}
