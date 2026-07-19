package com.weblocal.freelanceos.payment.dto;

import java.math.BigDecimal;

public record PaymentIntentResponseDto(
    String clientSecret,
    String publishableKey,
    BigDecimal montant,
    String devise,
    Long factureId
) {}
