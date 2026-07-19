package com.weblocal.freelanceos.payment.controller;

import com.weblocal.freelanceos.payment.dto.CreatePaymentIntentDto;
import com.weblocal.freelanceos.payment.dto.PaymentIntentResponseDto;
import com.weblocal.freelanceos.payment.dto.PaymentStatusDto;
import com.weblocal.freelanceos.payment.service.StripeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Contrôleur pour gérer les paiements Stripe.
 *
 * Endpoints accessibles:
 * - POST /api/payments/create-intent - Créer une intention de paiement (public)
 * - GET /api/payments/status/{intentId} - Vérifier le statut (public)
 * - POST /api/payments/confirm - Confirmer un paiement (admin)
 * - POST /api/payments/cancel - Annuler un paiement (admin)
 * - GET /api/payments/public-key - Obtenir la clé publique (public)
 */
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Gestion des paiements Stripe")
public class PaymentController {

    private final StripeService stripeService;

    /**
     * Crée une intention de paiement pour une facture.
     * Accessible aux clients sans authentification.
     */
    @PostMapping("/create-intent")
    @Operation(summary = "Créer une intention de paiement", description = "Crée une intention de paiement Stripe pour une facture")
    public ResponseEntity<PaymentIntentResponseDto> createPaymentIntent(
        @Valid @RequestBody CreatePaymentIntentDto request
    ) {
        PaymentIntentResponseDto response = stripeService.createPaymentIntent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Récupère le statut d'une intention de paiement.
     * Accessible aux clients sans authentification.
     */
    @GetMapping("/status/{intentId}")
    @Operation(summary = "Vérifier le statut du paiement", description = "Récupère le statut d'une intention de paiement")
    public ResponseEntity<PaymentStatusDto> getPaymentStatus(
        @PathVariable String intentId
    ) {
        PaymentStatusDto status = stripeService.getPaymentStatus(intentId);
        return ResponseEntity.ok(status);
    }

    /**
     * Confirme un paiement réussi.
     * Accessible aux administrateurs uniquement.
     */
    @PostMapping("/confirm/{intentId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Confirmer un paiement", description = "Marque un paiement comme réussi")
    public ResponseEntity<Void> confirmPayment(
        @PathVariable String intentId
    ) {
        stripeService.confirmPayment(intentId);
        return ResponseEntity.ok().build();
    }

    /**
     * Annule un paiement.
     * Accessible aux administrateurs uniquement.
     */
    @PostMapping("/cancel/{intentId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Annuler un paiement", description = "Marque un paiement comme annulé")
    public ResponseEntity<Void> cancelPayment(
        @PathVariable String intentId
    ) {
        stripeService.cancelPayment(intentId);
        return ResponseEntity.ok().build();
    }

    /**
     * Récupère la clé publique Stripe pour le formulaire.
     * Accessible sans authentification.
     */
    @GetMapping("/public-key")
    @Operation(summary = "Obtenir la clé publique Stripe", description = "Récupère la clé publique Stripe pour Stripe Elements")
    public ResponseEntity<java.util.Map<String, String>> getPublicKey() {
        return ResponseEntity.ok(java.util.Map.of(
            "publishableKey", stripeService.getPublishableKey()
        ));
    }
}
