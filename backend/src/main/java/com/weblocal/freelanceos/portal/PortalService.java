package com.weblocal.freelanceos.portal;

import com.weblocal.freelanceos.common.ConflictException;
import com.weblocal.freelanceos.common.ResourceNotFoundException;
import com.weblocal.freelanceos.invoice.Invoice;
import com.weblocal.freelanceos.invoice.InvoiceMapper;
import com.weblocal.freelanceos.invoice.InvoicePdfService;
import com.weblocal.freelanceos.invoice.InvoiceRepository;
import com.weblocal.freelanceos.invoice.StatutInvoice;
import com.weblocal.freelanceos.invoice.TypeInvoice;
import com.weblocal.freelanceos.invoice.dto.InvoiceResponseDto;
import com.weblocal.freelanceos.project.Project;
import com.weblocal.freelanceos.project.ProjectMapper;
import com.weblocal.freelanceos.project.ProjectRepository;
import com.weblocal.freelanceos.project.ProjectScreenshot;
import com.weblocal.freelanceos.project.ProjectScreenshotRepository;
import com.weblocal.freelanceos.project.dto.ProjectResponseDto;
import com.weblocal.freelanceos.project.dto.ScreenshotDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Logique du portail client : lecture seule, toujours filtrée par l'id du
 * client authentifié (jamais par un id passé en paramètre par le frontend),
 * pour qu'un client ne puisse JAMAIS voir les données d'un autre client même
 * en modifiant l'URL à la main.
 *
 * @Transactional : ProjectMapper/InvoiceMapper lisent des relations LAZY
 * (client, technos, lignes) — voir ProjectService/InvoiceService pour le
 * détail de cette nécessité.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class PortalService {

    private final ProjectRepository projectRepository;
    private final ProjectScreenshotRepository screenshotRepository;
    private final InvoiceRepository invoiceRepository;
    private final ProjectMapper projectMapper;
    private final InvoiceMapper invoiceMapper;
    private final InvoicePdfService invoicePdfService;

    public List<ProjectResponseDto> findMesProjects(Long clientId) {
        return projectRepository.findByClientIdOrderByStatutAscPositionAsc(clientId).stream()
                .map(this::toDto)
                .toList();
    }

    /**
     * Sert une capture d'écran, mais UNIQUEMENT si son projet appartient bien au
     * client authentifié : un client ne peut pas voir les captures d'un autre
     * client même en devinant un id. 404 (et non 403) pour ne pas révéler
     * l'existence de la ressource.
     */
    public ProjectScreenshot getScreenshotDuClient(Long clientId, Long projectId, Long screenshotId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Projet introuvable avec l'id : " + projectId));
        if (!project.getClient().getId().equals(clientId)) {
            throw new ResourceNotFoundException("Projet introuvable avec l'id : " + projectId);
        }
        return screenshotRepository.findByIdAndProjectId(screenshotId, projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Capture introuvable avec l'id : " + screenshotId));
    }

    private ProjectResponseDto toDto(Project project) {
        List<ScreenshotDto> screenshots = screenshotRepository.findByProjectIdOrderByIdAsc(project.getId()).stream()
                .map(m -> new ScreenshotDto(m.getId(), m.getFilename(), m.getContentType()))
                .toList();
        return projectMapper.toResponseDto(project, screenshots);
    }

    public List<InvoiceResponseDto> findMesInvoices(Long clientId) {
        return invoiceRepository.findByClientIdOrderByDateEmissionDesc(clientId).stream()
                .map(invoiceMapper::toResponseDto)
                .toList();
    }

    public InvoiceResponseDto findMonInvoice(Long clientId, Long invoiceId) {
        return invoiceMapper.toResponseDto(getInvoiceDuClientOuThrow(clientId, invoiceId));
    }

    /**
     * Acceptation en ligne d'un devis par le client (signature électronique
     * simple). Enregistre le nom du signataire, l'horodatage et l'IP comme
     * preuve, et fait passer le document au statut ACCEPTE.
     *
     * Contrôles : le document doit appartenir au client, être de type DEVIS et
     * ne pas être déjà accepté.
     */
    public InvoiceResponseDto accepterDevis(Long clientId, Long invoiceId, String signataireNom, String ip) {
        Invoice invoice = getInvoiceDuClientOuThrow(clientId, invoiceId);

        if (invoice.getType() != TypeInvoice.DEVIS) {
            throw new ConflictException("Seuls les devis peuvent être acceptés en ligne.");
        }
        if (invoice.getStatut() == StatutInvoice.ACCEPTE) {
            throw new ConflictException("Ce devis a déjà été accepté.");
        }

        invoice.setStatut(StatutInvoice.ACCEPTE);
        invoice.setSignataireNom(signataireNom);
        invoice.setDateAcceptation(java.time.LocalDateTime.now());
        invoice.setIpAcceptation(ip);
        invoiceRepository.save(invoice);

        return invoiceMapper.toResponseDto(invoice);
    }

    public byte[] genererPdf(Long clientId, Long invoiceId) {
        Invoice invoice = getInvoiceDuClientOuThrow(clientId, invoiceId);
        return invoicePdfService.genererPdf(invoice);
    }

    /**
     * Vérifie que le document appartient bien au client authentifié.
     * Renvoie un 404 "introuvable" plutôt qu'un 403 "interdit" si ce n'est
     * pas le cas : ça évite de confirmer à un client qu'un id de facture
     * appartenant à quelqu'un d'autre existe bel et bien (énumération).
     */
    private Invoice getInvoiceDuClientOuThrow(Long clientId, Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Document introuvable avec l'id : " + invoiceId));
        if (!invoice.getClient().getId().equals(clientId)) {
            throw new ResourceNotFoundException("Document introuvable avec l'id : " + invoiceId);
        }
        return invoice;
    }
}
