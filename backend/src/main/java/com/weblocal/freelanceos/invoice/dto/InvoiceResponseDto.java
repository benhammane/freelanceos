package com.weblocal.freelanceos.invoice.dto;

import com.weblocal.freelanceos.invoice.StatutInvoice;
import com.weblocal.freelanceos.invoice.TypeInvoice;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record InvoiceResponseDto(
        Long id,
        String numero,
        TypeInvoice type,
        Long clientId,
        String clientNom,
        Long projectId,
        String projectTitre,
        List<InvoiceLineDto> lignes,
        BigDecimal montantHT,
        BigDecimal tauxTVA,
        BigDecimal montantTTC,
        StatutInvoice statut,
        LocalDate dateEmission,
        LocalDate dateEcheance,
        String signataireNom,
        LocalDateTime dateAcceptation,
        String ipAcceptation
) {
}
