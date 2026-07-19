package com.weblocal.freelanceos.invoice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record InvoiceLineDto(
        @NotBlank(message = "La description de la ligne est obligatoire")
        String description,

        @Min(value = 1, message = "La quantité doit être au moins 1")
        int quantite,

        @NotNull(message = "Le prix unitaire est obligatoire")
        BigDecimal prixUnitaire
) {
}
