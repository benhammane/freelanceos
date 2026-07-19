package com.weblocal.freelanceos.payment.service;

import com.weblocal.freelanceos.invoice.Invoice;
import com.weblocal.freelanceos.invoice.InvoiceRepository;
import com.weblocal.freelanceos.invoice.StatutInvoice;
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

import java.time.LocalDateTime;

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
    private final InvoiceRepository invoiceRepository;

    public PaymentIntentResponseDto createPaymentIntent(CreatePaymentIntentDto request) {
        log.info("Création d'une intention de paiement pour la facture: {}", request.factureId());

        Invoice invoice = invoiceRepository.findById(request.factureId())
            .orElseThrow(() -> new RuntimeException("Facture non trouvée: " + request.factureId()));

        Payment payment = Payment.builder()
            .invoice(invoice)
            .montant(request.montant())
            .email(request.email())
            .devise("EUR")
            .statut(Payment.PaymentStatus.PENDING)
            .metadata(request.description())
            .build();

        Payment savedPayment = paymentRepository.save(payment);

        String clientSecret = "pi_" + System.currentTimeMillis() + "_secret_" + savedPayment.getId();
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

    public PaymentStatusDto getPaymentStatus(String stripePaymentIntentId) {
        Payment payment = paymentRepository.findByStripePaymentIntentId(stripePaymentIntentId)
            .orElseThrow(() -> new RuntimeException("Paiement non trouvé: " + stripePaymentIntentId));

        return new PaymentStatusDto(
            payment.getStatut().toString(),
            payment.getDataPaiement(),
            payment.getStripeReceiptUrl()
        );
    }

    public void confirmPayment(String stripePaymentIntentId) {
        log.info("Confirmation du paiement: {}", stripePaymentIntentId);

        Payment payment = paymentRepository.findByStripePaymentIntentId(stripePaymentIntentId)
            .orElseThrow(() -> new RuntimeException("Paiement non trouvé: " + stripePaymentIntentId));

        payment.setStatut(Payment.PaymentStatus.SUCCEEDED);
        payment.setDataPaiement(LocalDateTime.now());
        payment.setStripeReceiptUrl("https://receipts.stripe.test/" + stripePaymentIntentId);

        Invoice invoice = payment.getInvoice();
        invoice.setStatut(StatutInvoice.PAYE);

        paymentRepository.save(payment);
        invoiceRepository.save(invoice);

        log.info("Paiement confirmé: {}", stripePaymentIntentId);
    }

    public void cancelPayment(String stripePaymentIntentId) {
        Payment payment = paymentRepository.findByStripePaymentIntentId(stripePaymentIntentId)
            .orElseThrow(() -> new RuntimeException("Paiement non trouvé: " + stripePaymentIntentId));

        payment.setStatut(Payment.PaymentStatus.CANCELLED);
        paymentRepository.save(payment);

        log.info("Paiement annulé: {}", stripePaymentIntentId);
    }

    public String getPublishableKey() {
        return stripePublishableKey;
    }
}
