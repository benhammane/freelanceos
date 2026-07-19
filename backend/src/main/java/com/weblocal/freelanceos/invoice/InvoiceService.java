package com.weblocal.freelanceos.invoice;

import com.weblocal.freelanceos.client.Client;
import com.weblocal.freelanceos.client.ClientRepository;
import com.weblocal.freelanceos.common.ResourceNotFoundException;
import com.weblocal.freelanceos.invoice.dto.InvoiceRequestDto;
import com.weblocal.freelanceos.invoice.dto.InvoiceResponseDto;
import com.weblocal.freelanceos.invoice.dto.InvoiceStatutDto;
import com.weblocal.freelanceos.project.Project;
import com.weblocal.freelanceos.project.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;

/**
 * @Transactional au niveau de la classe : chaque méthode publique s'exécute
 * dans sa propre transaction/session Hibernate. C'est indispensable ici car
 * Invoice a des relations LAZY (client, project) et une collection LAZY
 * (lignes) : en dehors d'une transaction ouverte (et avec
 * spring.jpa.open-in-view=false dans application.yml, qui évite de garder
 * la session ouverte pendant tout le rendu de la réponse HTTP — une pratique
 * plus saine mais qui demande cette discipline), toute tentative de lire ces
 * champs après le retour du repository lève une LazyInitializationException.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final ClientRepository clientRepository;
    private final ProjectRepository projectRepository;
    private final InvoiceMapper invoiceMapper;
    private final InvoicePdfService invoicePdfService;

    public List<InvoiceResponseDto> findAll() {
        return invoiceRepository.findAll().stream()
                .map(invoiceMapper::toResponseDto)
                .toList();
    }

    public InvoiceResponseDto findById(Long id) {
        return invoiceMapper.toResponseDto(getInvoiceOrThrow(id));
    }

    public InvoiceResponseDto create(InvoiceRequestDto dto) {
        Client client = getClientOrThrow(dto.clientId());
        Project project = getProjectOrNull(dto.projectId());

        Invoice invoice = new Invoice();
        invoiceMapper.applyRequestDto(invoice, dto, client, project);
        invoice.setNumero(genererNumero(dto.type(), dto.dateEmission()));
        calculerMontants(invoice);

        return invoiceMapper.toResponseDto(invoiceRepository.save(invoice));
    }

    public InvoiceResponseDto update(Long id, InvoiceRequestDto dto) {
        Invoice invoice = getInvoiceOrThrow(id);
        Client client = getClientOrThrow(dto.clientId());
        Project project = getProjectOrNull(dto.projectId());

        // Le numéro et le type ne changent jamais lors d'une modification :
        // seul le contenu (lignes, montants, statut, dates) est mis à jour.
        invoiceMapper.applyRequestDto(invoice, dto, client, project);
        calculerMontants(invoice);

        return invoiceMapper.toResponseDto(invoiceRepository.save(invoice));
    }

    public InvoiceResponseDto changerStatut(Long id, InvoiceStatutDto dto) {
        Invoice invoice = getInvoiceOrThrow(id);
        invoice.setStatut(dto.statut());
        return invoiceMapper.toResponseDto(invoiceRepository.save(invoice));
    }

    /**
     * Transforme un devis existant en une NOUVELLE facture : même client,
     * projet et lignes, mais nouveau numéro (préfixe FAC), nouvelle date
     * d'émission (aujourd'hui) et statut réinitialisé à BROUILLON. Le devis
     * d'origine n'est pas modifié ni supprimé : on garde une trace des deux
     * documents, ce qui est la pratique comptable normale.
     */
    public InvoiceResponseDto convertirEnFacture(Long id) {
        Invoice devis = getInvoiceOrThrow(id);
        if (devis.getType() != TypeInvoice.DEVIS) {
            throw new IllegalStateException("Seul un devis peut être converti en facture");
        }

        Invoice facture = new Invoice();
        facture.setType(TypeInvoice.FACTURE);
        facture.setClient(devis.getClient());
        facture.setProject(devis.getProject());
        facture.setLignes(List.copyOf(devis.getLignes()));
        facture.setTauxTVA(devis.getTauxTVA());
        facture.setStatut(StatutInvoice.BROUILLON);
        facture.setDateEmission(LocalDate.now());
        facture.setNumero(genererNumero(TypeInvoice.FACTURE, facture.getDateEmission()));
        calculerMontants(facture);

        return invoiceMapper.toResponseDto(invoiceRepository.save(facture));
    }

    public void delete(Long id) {
        Invoice invoice = getInvoiceOrThrow(id);
        invoiceRepository.delete(invoice);
    }

    /**
     * Génère le PDF au sein de la MÊME transaction que la lecture de la
     * facture : InvoicePdfService accède aux lignes et au client de l'entité,
     * qui doivent donc encore être "attachés" à une session Hibernate active.
     */
    public byte[] genererPdf(Long id) {
        Invoice invoice = getInvoiceOrThrow(id);
        return invoicePdfService.genererPdf(invoice);
    }

    Invoice getInvoiceOrThrow(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Devis/facture introuvable avec l'id : " + id));
    }

    private Client getClientOrThrow(Long clientId) {
        return clientRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Client introuvable avec l'id : " + clientId));
    }

    private Project getProjectOrNull(Long projectId) {
        if (projectId == null) {
            return null;
        }
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Projet introuvable avec l'id : " + projectId));
    }

    /**
     * Calcule montantHT (somme des lignes) et montantTTC (HT + TVA) et les
     * affecte directement sur l'entité. Toujours recalculé côté serveur :
     * on ne fait jamais confiance à des montants envoyés par le frontend.
     * setScale(2, RoundingMode.HALF_UP) : arrondit au centime le plus proche,
     * comme attendu pour un montant en euros.
     */
    void calculerMontants(Invoice invoice) {
        BigDecimal montantHT = invoice.getLignes().stream()
                .map(InvoiceLine::montantLigne)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal tauxMultiplicateur = BigDecimal.ONE.add(
                invoice.getTauxTVA().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP)
        );
        BigDecimal montantTTC = montantHT.multiply(tauxMultiplicateur).setScale(2, RoundingMode.HALF_UP);

        invoice.setMontantHT(montantHT);
        invoice.setMontantTTC(montantTTC);
    }

    /**
     * Génère un numéro séquentiel par type et par année, ex: "DEV-2026-0001"
     * ou "FAC-2026-0007". Le compteur repart de 1 chaque nouvelle année.
     *
     * Limite connue : deux créations strictement simultanées pourraient en
     * théorie obtenir le même numéro (pas de verrou/séquence base de données
     * dédiée). Acceptable pour un usage freelance solo ; à revoir si l'appli
     * devient multi-utilisateurs concurrents.
     */
    private String genererNumero(TypeInvoice type, LocalDate dateEmission) {
        String prefixe = type == TypeInvoice.DEVIS ? "DEV" : "FAC";
        int annee = Year.from(dateEmission).getValue();
        LocalDate debutAnnee = LocalDate.of(annee, 1, 1);
        LocalDate finAnnee = LocalDate.of(annee, 12, 31);

        long compteur = invoiceRepository.countByTypeAndDateEmissionBetween(type, debutAnnee, finAnnee) + 1;
        return "%s-%d-%04d".formatted(prefixe, annee, compteur);
    }
}
