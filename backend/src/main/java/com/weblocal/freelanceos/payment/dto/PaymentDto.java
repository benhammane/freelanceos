package com.weblocal.freelanceos.payment.dto;

import com.weblocal.freelanceos.payment.entity.Payment;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentDto(
    Long id,
    Long factureId,
    Long userId,
    @NotNull @Positive BigDecimal montant,
    String statut,
    String devise,
    String email,
    LocalDateTime datePaiement,
    String stripeReceiptUrl
) implements Serializable {}

record CreatePaymentIntentDto(
    @NotNull Long factureId,
    @NotNull @Positive BigDecimal montant,
    @NotBlank String email,
    String description
) {}

record PaymentIntentResponseDto(
    String clientSecret,
    String publishableKey,
    BigDecimal montant,
    String devise,
    Long factureId
) {}

record UpdatePaymentStatusDto(
    @NotBlank String stripePaymentIntentId,
    @NotBlank String statut
) {}

record PaymentStatusDto(
    String statut,
    LocalDateTime datePaiement,
    String receiptUrl
) {}
