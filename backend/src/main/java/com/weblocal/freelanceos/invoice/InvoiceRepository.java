package com.weblocal.freelanceos.invoice;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    /**
     * Utilisé pour générer le prochain numéro séquentiel d'un devis/facture
     * pour l'année en cours (voir InvoiceService.genererNumero) : compte
     * combien de documents de ce type existent déjà entre le 1er janvier et
     * le 31 décembre de l'année demandée.
     */
    long countByTypeAndDateEmissionBetween(TypeInvoice type, LocalDate debut, LocalDate fin);

    /** Utilisé par le dashboard pour calculer le CA du mois et les impayés. */
    List<Invoice> findByType(TypeInvoice type);

    /** Utilisé lors de la suppression d'un projet, pour détacher ses devis/factures (voir ProjectService.delete). */
    List<Invoice> findByProjectId(Long projectId);

    /** Utilisé par ClientService pour empêcher la suppression d'un client encore lié à des devis/factures. */
    boolean existsByClientId(Long clientId);

    /** Utilisé par le portail client (PortalService) pour ne lister que les documents du client authentifié. */
    List<Invoice> findByClientIdOrderByDateEmissionDesc(Long clientId);
}
