package com.weblocal.freelanceos.payment.service;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import com.weblocal.freelanceos.invoice.Invoice;
import com.weblocal.freelanceos.invoice.InvoiceRepository;
import com.weblocal.freelanceos.invoice.StatutInvoice;
import com.weblocal.freelanceos.payment.dto.PaymentIntentResponseDto;
import com.weblocal.freelanceos.payment.entity.Payment;
import com.weblocal.freelanceos.payment.repository.PaymentRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Intégration Stripe réelle pour le paiement de factures en ligne.
 *
 * Principe (sécurisé et conforme PCI) :
 *  1. Le client demande à payer une facture (POST /create-intent {invoiceId}).
 *     Le MONTANT n'est jamais fourni par le client : il est recalculé ici à
 *     partir de la facture en base, pour qu'on ne puisse pas payer moins que dû.
 *  2. On crée une "PaymentIntent" chez Stripe et on renvoie son client_secret.
 *  3. Le navigateur confirme le paiement directement auprès de Stripe via
 *     Stripe Elements : les données de carte ne transitent JAMAIS par ce serveur.
 *  4. Stripe notifie ce serveur du succès via un webhook signé (handleWebhook),
 *     seul moment fiable pour marquer la facture comme payée.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StripeService {

    @Value("${app.stripe.secret-key}")
    private String stripeSecretKey;

    @Value("${app.stripe.publishable-key}")
    private String stripePublishableKey;

    @Value("${app.stripe.webhook-secret}")
    private String stripeWebhookSecret;

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;

    @PostConstruct
    void init() {
        com.stripe.Stripe.apiKey = stripeSecretKey;
    }

    /**
     * Crée une intention de paiement Stripe pour une facture donnée.
     * Le montant est celui de la facture (TTC), calculé côté serveur.
     */
    @Transactional
    public PaymentIntentResponseDto createPaymentIntent(Long invoiceId, String payerEmail) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Facture introuvable : " + invoiceId));

        if (invoice.getStatut() == StatutInvoice.PAYE) {
            throw new IllegalStateException("Cette facture est déjà payée.");
        }

        long amountInCents = toCents(invoice.getMontantTTC());

        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency("eur")
                    .putMetadata("invoiceId", invoiceId.toString())
                    .setReceiptEmail(payerEmail)
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build())
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);

            Payment payment = Payment.builder()
                    .invoice(invoice)
                    .stripePaymentIntentId(intent.getId())
                    .montant(invoice.getMontantTTC())
                    .email(payerEmail)
                    .devise("EUR")
                    .statut(Payment.PaymentStatus.PENDING)
                    .build();
            paymentRepository.save(payment);

            log.info("PaymentIntent Stripe créé {} pour la facture {}", intent.getId(), invoiceId);

            return new PaymentIntentResponseDto(
                    intent.getClientSecret(),
                    stripePublishableKey,
                    invoice.getMontantTTC(),
                    "eur",
                    invoiceId);
        } catch (StripeException e) {
            log.error("Échec de création du PaymentIntent Stripe : {}", e.getMessage());
            throw new RuntimeException("Échec de l'initialisation du paiement Stripe.", e);
        }
    }

    /**
     * Traite un webhook Stripe. Vérifie d'abord la signature (preuve que la
     * requête vient réellement de Stripe), puis met à jour paiement + facture
     * selon l'événement reçu.
     */
    @Transactional
    public void handleWebhook(String payload, String signatureHeader) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, signatureHeader, stripeWebhookSecret);
        } catch (SignatureVerificationException e) {
            log.warn("Signature de webhook Stripe invalide : {}", e.getMessage());
            throw new IllegalArgumentException("Signature de webhook invalide.");
        }

        switch (event.getType()) {
            case "payment_intent.succeeded" -> markSucceeded(extractPaymentIntent(event));
            case "payment_intent.payment_failed" -> markFailed(extractPaymentIntent(event));
            default -> log.debug("Événement Stripe ignoré : {}", event.getType());
        }
    }

    public String getPublishableKey() {
        return stripePublishableKey;
    }

    /**
     * Re-vérifie le statut d'un paiement DIRECTEMENT auprès de Stripe et met à
     * jour la facture si le paiement a réussi. Sert de filet de sécurité au
     * webhook : appelable par le client après confirmation, mais l'état fait
     * toujours foi côté Stripe (on ne fait donc pas confiance au client).
     */
    @Transactional
    public String syncPaymentStatus(String paymentIntentId) {
        try {
            PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
            if ("succeeded".equals(intent.getStatus())) {
                markSucceeded(intent);
            }
            return intent.getStatus();
        } catch (StripeException e) {
            log.error("Échec de récupération du PaymentIntent {} : {}", paymentIntentId, e.getMessage());
            throw new RuntimeException("Impossible de vérifier le statut du paiement.", e);
        }
    }

    private void markSucceeded(PaymentIntent intent) {
        if (intent == null) return;
        paymentRepository.findByStripePaymentIntentId(intent.getId()).ifPresent(payment -> {
            payment.setStatut(Payment.PaymentStatus.SUCCEEDED);
            payment.setDataPaiement(LocalDateTime.now());
            paymentRepository.save(payment);

            Invoice invoice = payment.getInvoice();
            invoice.setStatut(StatutInvoice.PAYE);
            invoiceRepository.save(invoice);

            log.info("Paiement confirmé pour la facture {} (intent {})",
                    invoice.getId(), intent.getId());
        });
    }

    private void markFailed(PaymentIntent intent) {
        if (intent == null) return;
        paymentRepository.findByStripePaymentIntentId(intent.getId()).ifPresent(payment -> {
            payment.setStatut(Payment.PaymentStatus.FAILED);
            paymentRepository.save(payment);
            log.info("Paiement échoué pour l'intent {}", intent.getId());
        });
    }

    private PaymentIntent extractPaymentIntent(Event event) {
        return (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
    }

    /** Convertit un montant en euros (BigDecimal) vers la plus petite unité (centimes). */
    private long toCents(BigDecimal euros) {
        return euros.movePointRight(2).setScale(0, RoundingMode.HALF_UP).longValueExact();
    }

    // Conservé pour compatibilité : la confirmation réelle passe par le webhook.
    public Map<String, String> publicKeyResponse() {
        return Map.of("publishableKey", stripePublishableKey);
    }
}
