package com.weblocal.freelanceos.payment.entity;

import com.weblocal.freelanceos.common.entity.BaseEntity;
import com.weblocal.freelanceos.facture.entity.Facture;
import com.weblocal.freelanceos.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment extends BaseEntity {

    @Column(nullable = false)
    private String stripePaymentIntentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Facture facture;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private BigDecimal montant;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private PaymentStatus statut = PaymentStatus.PENDING;

    @Column(nullable = false)
    private String devise = "EUR";

    @Column
    private String email;

    @Column
    private LocalDateTime dataPaiement;

    @Column
    private String stripeReceiptUrl;

    @Column(columnDefinition = "TEXT")
    private String metadata;

    public enum PaymentStatus {
        PENDING,      // En attente
        SUCCEEDED,    // Réussi
        FAILED,       // Échoué
        CANCELLED     // Annulé
    }
}
