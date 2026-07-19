package com.weblocal.freelanceos.payment.repository;

import com.weblocal.freelanceos.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByStripePaymentIntentId(String stripePaymentIntentId);

    List<Payment> findByFactureId(Long factureId);

    List<Payment> findByUserId(Long userId);

    Optional<Payment> findByFactureIdAndStatut(Long factureId, Payment.PaymentStatus statut);

    List<Payment> findByStatut(Payment.PaymentStatus statut);
}
