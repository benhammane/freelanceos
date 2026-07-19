package com.weblocal.freelanceos.payment.dto;

import java.time.LocalDateTime;

public record PaymentStatusDto(
    String statut,
    LocalDateTime datePaiement,
    String receiptUrl
) {}
