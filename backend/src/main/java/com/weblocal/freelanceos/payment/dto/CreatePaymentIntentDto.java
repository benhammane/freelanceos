package com.weblocal.freelanceos.payment.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Requête de création d'une intention de paiement.
 * Seul l'identifiant de la facture est nécessaire : le montant est déterminé
 * côté serveur à partir de la facture (voir StripeService), jamais fourni par
 * le client. L'email (optionnel) sert à l'envoi du reçu Stripe.
 */
public record CreatePaymentIntentDto(
    @NotNull Long invoiceId,
    String email
) {}
