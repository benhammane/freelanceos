package com.weblocal.freelanceos.invoice;

import com.weblocal.freelanceos.client.Client;
import com.weblocal.freelanceos.common.BaseEntity;
import com.weblocal.freelanceos.project.Project;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Entité JPA représentant un devis ou une facture.
 *
 * - project est en relation optionnelle (nullable = true, valeur par défaut) :
 *   un devis/facture peut être libre, sans être rattaché à un projet précis.
 * - lignes utilise @ElementCollection avec des InvoiceLine (@Embeddable) :
 *   JPA crée une table "invoice_lignes" avec une colonne "invoice_id" pointant
 *   vers cette facture, et une ligne de table par élément de la liste.
 * - montantHT/montantTTC sont RECALCULÉS par InvoiceService à chaque
 *   création/modification (jamais laissés au frontend à fournir directement),
 *   pour garantir que la valeur stockée en base est toujours cohérente avec
 *   les lignes et le taux de TVA.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "invoices")
public class Invoice extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String numero;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeInvoice type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @ElementCollection
    @CollectionTable(name = "invoice_lignes", joinColumns = @JoinColumn(name = "invoice_id"))
    private List<InvoiceLine> lignes = new ArrayList<>();

    @Column(nullable = false)
    private BigDecimal montantHT;

    @Column(nullable = false)
    private BigDecimal tauxTVA;

    @Column(nullable = false)
    private BigDecimal montantTTC;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutInvoice statut;

    @Column(nullable = false)
    private LocalDate dateEmission;

    private LocalDate dateEcheance;
}
