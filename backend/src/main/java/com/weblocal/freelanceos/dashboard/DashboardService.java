package com.weblocal.freelanceos.dashboard;

import com.weblocal.freelanceos.client.ClientRepository;
import com.weblocal.freelanceos.dashboard.dto.DashboardSummaryDto;
import com.weblocal.freelanceos.invoice.Invoice;
import com.weblocal.freelanceos.invoice.InvoiceRepository;
import com.weblocal.freelanceos.invoice.StatutInvoice;
import com.weblocal.freelanceos.invoice.TypeInvoice;
import com.weblocal.freelanceos.project.ProjectRepository;
import com.weblocal.freelanceos.project.StatutProjet;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ClientRepository clientRepository;
    private final ProjectRepository projectRepository;
    private final InvoiceRepository invoiceRepository;

    /**
     * On récupère toutes les FACTURES (pas les devis) une seule fois, puis on
     * calcule les deux agrégats en mémoire avec des streams plutôt qu'avec
     * deux requêtes SQL séparées : le volume de données d'un freelance solo
     * reste largement raisonnable pour ce genre de traitement côté application.
     */
    public DashboardSummaryDto getSummary() {
        long nombreClients = clientRepository.count();
        long projetsEnCours = projectRepository.countByStatut(StatutProjet.EN_COURS);

        List<Invoice> factures = invoiceRepository.findByType(TypeInvoice.FACTURE);
        YearMonth moisEnCours = YearMonth.now();

        BigDecimal chiffreAffairesMois = factures.stream()
                .filter(f -> f.getStatut() == StatutInvoice.PAYE)
                .filter(f -> YearMonth.from(f.getDateEmission()).equals(moisEnCours))
                .map(Invoice::getMontantTTC)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Set<StatutInvoice> statutsImpayes = Set.of(StatutInvoice.ENVOYE, StatutInvoice.EN_RETARD);
        BigDecimal montantFacturesImpayees = factures.stream()
                .filter(f -> statutsImpayes.contains(f.getStatut()))
                .map(Invoice::getMontantTTC)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new DashboardSummaryDto(nombreClients, projetsEnCours, chiffreAffairesMois, montantFacturesImpayees);
    }
}
