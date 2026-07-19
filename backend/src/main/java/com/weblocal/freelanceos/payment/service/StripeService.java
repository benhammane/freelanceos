package com.weblocal.freelanceos.payment.service;

import com.weblocal.freelanceos.facture.entity.Facture;
import com.weblocal.freelanceos.facture.repository.FactureRepository;
import com.weblocal.freelanceos.payment.dto.CreatePaymentIntentDto;
import com.weblocal.freelanceos.payment.dto.PaymentIntentResponseDto;
import com.weblocal.freelanceos.payment.dto.PaymentStatusDto;
import com.weblocal.freelanceos.payment.entity.Payment;
import com.weblocal.freelanceos.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Service pour gérer les paiements avec Stripe.
 *
 * Note: Pour tester, utilisez les clés de test Stripe:
 * - Clé secrète: sk_test_... (à générer sur https://dashboard.stripe.com)
 * - Clé publique: pk_test_... (à générer sur https://dashboard.stripe.com)
 *
 * Carte de test: 4242 4242 4242 4242 (tout mois/année futur, tout CVC)
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class StripeService {

    @Value("${app.stripe.secret-key:sk_test_default}")
    private String stripeSecretKey;

    @Value("${app.stripe.publishable-key:pk_test_default}")
    private String stripePublishableKey;

    private final PaymentRepository paymentRepository;
    private final FactureRepository factureRepository;

    /**
     * Crée une intention de paiement Stripe pour une facture.
     * En production, cette méthode utiliserait l'API Stripe réelle.
     */
    public PaymentIntentResponseDto createPaymentIntent(CreatePaymentIntentDto request) {
        log.info("Création d'une intention de paiement pour la facture: {}", request.factureId());

        // Vérifier que la facture existe
        Facture facture = factureRepository.findById(request.factureId())
            .orElseThrow(() -> new RuntimeException("Facture non trouvée: " + request.factureId()));

        // Créer l'enregistrement du paiement
        Payment payment = Payment.builder()
            .facture(facture)
            .montant(request.montant())
            .email(request.email())
            .devise("EUR")
            .statut(Payment.PaymentStatus.PENDING)
            .metadata(request.description())
            .build();

        Payment savedPayment = paymentRepository.save(payment);

        // En production: utiliser l'API Stripe réelle
        // Ci-dessous: simulation avec un ID factice
        String clientSecret = "pi_" + System.currentTimeMillis() + "_secret_" + savedPayment.getId();

        // Mettre à jour le paiement avec l'ID Stripe
        savedPayment.setStripePaymentIntentId("pi_" + System.currentTimeMillis() + "_" + savedPayment.getId());
        paymentRepository.save(savedPayment);

        log.info("Intention de paiement créée: {}", savedPayment.getStripePaymentIntentId());

        return new PaymentIntentResponseDto(
            clientSecret,
            stripePublishableKey,
            request.montant(),
            "EUR",
            request.factureId()
        );
    }

    /**
     * Récupère le statut d'un paiement via l'ID Stripe.
     */
    public PaymentStatusDto getPaymentStatus(String stripePaymentIntentId) {
        log.info("Récupération du statut du paiement: {}", stripePaymentIntentId);

        Payment payment = paymentRepository.findByStripePaymentIntentId(stripePaymentIntentId)
            .orElseThrow(() -> new RuntimeException("Paiement non trouvé: " + stripePaymentIntentId));

        return new PaymentStatusDto(
            payment.getStatut().toString(),
            payment.getDataPaiement(),
            payment.getStripeReceiptUrl()
        );
    }

    /**
     * Confirme un paiement réussi (appelé après confirmation du client).
     */
    public void confirmPayment(String stripePaymentIntentId) {
        log.info("Confirmation du paiement: {}", stripePaymentIntentId);

        Payment payment = paymentRepository.findByStripePaymentIntentId(stripePaymentIntentId)
            .orElseThrow(() -> new RuntimeException("Paiement non trouvé: " + stripePaymentIntentId));

        payment.setStatut(Payment.PaymentStatus.SUCCEEDED);
        payment.setDataPaiement(LocalDateTime.now());
        payment.setStripeReceiptUrl("https://receipts.stripe.test/" + stripePaymentIntentId);

        // Mettre à jour la facture comme payée
        Facture facture = payment.getFacture();
        facture.setMontantPaye(facture.getMontantPaye().add(payment.getMontant()));
        if (facture.getMontantPaye().compareTo(facture.getMontantTotal()) >= 0) {
            facture.setStatut("PAYED");
        }

        paymentRepository.save(payment);
        factureRepository.save(facture);

        log.info("Paiement confirmé: {}", stripePaymentIntentId);
    }

    /**
     * Annule un paiement.
     */
    public void cancelPayment(String stripePaymentIntentId) {
        log.info("Annulation du paiement: {}", stripePaymentIntentId);

        Payment payment = paymentRepository.findByStripePaymentIntentId(stripePaymentIntentId)
            .orElseThrow(() -> new RuntimeException("Paiement non trouvé: " + stripePaymentIntentId));

        payment.setStatut(Payment.PaymentStatus.CANCELLED);
        paymentRepository.save(payment);

        log.info("Paiement annulé: {}", stripePaymentIntentId);
    }

    /**
     * Récupère la clé publique Stripe pour le formulaire.
     */
    public String getPublishableKey() {
        return stripePublishableKey;
    }

    /**
     * Récupère l'historique des paiements pour une facture.
     */
    public java.util.List<Payment> getPaymentsByInvoice(Long factureId) {
        return paymentRepository.findByFactureId(factureId);
    }
}
