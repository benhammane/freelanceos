package com.weblocal.freelanceos.payment.repository;

import com.weblocal.freelanceos.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByStripePaymentIntentId(String stripePaymentIntentId);

    List<Payment> findByInvoiceId(Long invoiceId);

    List<Payment> findByStatut(Payment.PaymentStatus statut);
}
