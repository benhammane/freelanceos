package com.weblocal.freelanceos.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record CreatePaymentIntentDto(
    @NotNull Long factureId,
    @NotNull @Positive BigDecimal montant,
    @NotBlank String email,
    String description
) {}
