package com.weblocal.freelanceos.payment.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentDto(
    Long id,
    Long invoiceId,
    Long userId,
    @NotNull @Positive BigDecimal montant,
    String statut,
    String devise,
    String email,
    LocalDateTime datePaiement,
    String stripeReceiptUrl
) implements Serializable {}
