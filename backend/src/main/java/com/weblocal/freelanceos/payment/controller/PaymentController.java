package com.weblocal.freelanceos.payment.controller;

import com.weblocal.freelanceos.payment.dto.CreatePaymentIntentDto;
import com.weblocal.freelanceos.payment.dto.PaymentIntentResponseDto;
import com.weblocal.freelanceos.payment.service.StripeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Endpoints de paiement Stripe.
 *
 * - POST /api/payments/create-intent : crée une intention de paiement pour une
 *   facture (accessible au client authentifié qui paie sa facture).
 * - GET  /api/payments/public-key    : renvoie la clé publique Stripe (front).
 * - POST /api/payments/webhook       : reçu de Stripe (signature vérifiée), non
 *   authentifié côté Spring Security mais protégé par la signature Stripe.
 */
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Payments", description = "Paiements en ligne Stripe")
public class PaymentController {

    private final StripeService stripeService;

    @PostMapping("/create-intent")
    @Operation(summary = "Créer une intention de paiement pour une facture")
    public ResponseEntity<PaymentIntentResponseDto> createPaymentIntent(
            @Valid @RequestBody CreatePaymentIntentDto request
    ) {
        PaymentIntentResponseDto response =
                stripeService.createPaymentIntent(request.invoiceId(), request.email());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/public-key")
    @Operation(summary = "Obtenir la clé publique Stripe")
    public ResponseEntity<Map<String, String>> getPublicKey() {
        return ResponseEntity.ok(stripeService.publicKeyResponse());
    }

    @PostMapping("/{intentId}/sync")
    @Operation(summary = "Re-vérifier le statut d'un paiement auprès de Stripe")
    public ResponseEntity<Map<String, String>> syncStatus(@PathVariable String intentId) {
        String status = stripeService.syncPaymentStatus(intentId);
        return ResponseEntity.ok(Map.of("status", status));
    }

    /**
     * Webhook Stripe : Stripe appelle cette URL après un paiement. La confiance
     * repose sur la vérification de la signature (en-tête Stripe-Signature), pas
     * sur une authentification classique — d'où l'accès public dans SecurityConfig.
     */
    @PostMapping("/webhook")
    @Operation(summary = "Webhook Stripe (confirmation de paiement)")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String signature
    ) {
        try {
            stripeService.handleWebhook(payload, signature);
            return ResponseEntity.ok("");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
