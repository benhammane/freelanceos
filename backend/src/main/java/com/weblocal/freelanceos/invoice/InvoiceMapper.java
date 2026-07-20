package com.weblocal.freelanceos.invoice;

import com.weblocal.freelanceos.client.Client;
import com.weblocal.freelanceos.invoice.dto.InvoiceLineDto;
import com.weblocal.freelanceos.invoice.dto.InvoiceRequestDto;
import com.weblocal.freelanceos.invoice.dto.InvoiceResponseDto;
import com.weblocal.freelanceos.project.Project;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class InvoiceMapper {

    /**
     * Construit les lignes (entité embeddable) à partir des DTO reçus.
     * Étape purement structurelle : le calcul des montants totaux se fait
     * ailleurs, dans InvoiceService, qui a la responsabilité métier des calculs.
     */
    public List<InvoiceLine> toLignes(List<InvoiceLineDto> dtos) {
        return dtos.stream()
                .map(dto -> new InvoiceLine(dto.description(), dto.quantite(), dto.prixUnitaire()))
                .toList();
    }

    public void applyRequestDto(Invoice invoice, InvoiceRequestDto dto, Client client, Project project) {
        invoice.setType(dto.type());
        invoice.setClient(client);
        invoice.setProject(project);
        invoice.setLignes(toLignes(dto.lignes()));
        invoice.setTauxTVA(dto.tauxTVA());
        invoice.setStatut(dto.statut());
        invoice.setDateEmission(dto.dateEmission());
        invoice.setDateEcheance(dto.dateEcheance());
    }

    public InvoiceResponseDto toResponseDto(Invoice invoice) {
        List<InvoiceLineDto> lignes = invoice.getLignes().stream()
                .map(l -> new InvoiceLineDto(l.getDescription(), l.getQuantite(), l.getPrixUnitaire()))
                .toList();

        return new InvoiceResponseDto(
                invoice.getId(),
                invoice.getNumero(),
                invoice.getType(),
                invoice.getClient().getId(),
                invoice.getClient().getNom(),
                invoice.getProject() != null ? invoice.getProject().getId() : null,
                invoice.getProject() != null ? invoice.getProject().getTitre() : null,
                lignes,
                invoice.getMontantHT(),
                invoice.getTauxTVA(),
                invoice.getMontantTTC(),
                invoice.getStatut(),
                invoice.getDateEmission(),
                invoice.getDateEcheance(),
                invoice.getSignataireNom(),
                invoice.getDateAcceptation(),
                invoice.getIpAcceptation()
        );
    }
}
