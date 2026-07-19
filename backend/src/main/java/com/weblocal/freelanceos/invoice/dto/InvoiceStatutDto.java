package com.weblocal.freelanceos.invoice.dto;

import com.weblocal.freelanceos.invoice.StatutInvoice;
import jakarta.validation.constraints.NotNull;

/** DTO minimal pour le changement de statut d'un devis/facture (PATCH). */
public record InvoiceStatutDto(
        @NotNull(message = "Le statut est obligatoire")
        StatutInvoice statut
) {
}
