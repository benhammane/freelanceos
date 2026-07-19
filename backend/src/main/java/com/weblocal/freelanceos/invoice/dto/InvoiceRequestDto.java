package com.weblocal.freelanceos.invoice.dto;

import com.weblocal.freelanceos.invoice.StatutInvoice;
import com.weblocal.freelanceos.invoice.TypeInvoice;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO d'entrée pour créer/modifier un devis ou une facture.
 * Ne contient PAS montantHT/montantTTC : ces montants sont toujours
 * recalculés côté serveur à partir des lignes et du taux de TVA
 * (voir InvoiceService.calculerMontants), jamais fournis par le client de l'API.
 *
 * @Valid sur la liste "lignes" : sans cette annotation, Bean Validation
 * validerait uniquement que la liste n'est pas vide (@NotEmpty), mais PAS le
 * contenu de chaque InvoiceLineDto qu'elle contient. @Valid déclenche une
 * validation "en cascade" sur chaque élément de la liste.
 */
public record InvoiceRequestDto(
        @NotNull(message = "Le type (DEVIS/FACTURE) est obligatoire")
        TypeInvoice type,

        @NotNull(message = "Le client est obligatoire")
        Long clientId,

        Long projectId,

        @NotEmpty(message = "Le devis/la facture doit contenir au moins une ligne")
        @Valid
        List<InvoiceLineDto> lignes,

        @NotNull(message = "Le taux de TVA est obligatoire")
        BigDecimal tauxTVA,

        @NotNull(message = "Le statut est obligatoire")
        StatutInvoice statut,

        @NotNull(message = "La date d'émission est obligatoire")
        LocalDate dateEmission,

        LocalDate dateEcheance
) {
}
