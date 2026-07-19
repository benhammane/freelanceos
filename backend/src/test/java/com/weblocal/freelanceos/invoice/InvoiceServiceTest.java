package com.weblocal.freelanceos.invoice;

import com.weblocal.freelanceos.client.Client;
import com.weblocal.freelanceos.client.ClientRepository;
import com.weblocal.freelanceos.common.ResourceNotFoundException;
import com.weblocal.freelanceos.invoice.dto.InvoiceLineDto;
import com.weblocal.freelanceos.invoice.dto.InvoiceRequestDto;
import com.weblocal.freelanceos.invoice.dto.InvoiceResponseDto;
import com.weblocal.freelanceos.project.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InvoiceServiceTest {

    @Mock
    private InvoiceRepository invoiceRepository;
    @Mock
    private ClientRepository clientRepository;
    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private InvoicePdfService invoicePdfService;

    private InvoiceService invoiceService;

    @BeforeEach
    void setUp() {
        invoiceService = new InvoiceService(
                invoiceRepository, clientRepository, projectRepository,
                new InvoiceMapper(), invoicePdfService
        );
    }

    private Client unClient() {
        Client client = new Client();
        client.setNom("Acme Corp");
        client.setEmail("contact@acme.test");
        return client;
    }

    @Test
    void calculerMontants_sommeLesLignesEtAppliqueLaTva() {
        Invoice invoice = new Invoice();
        invoice.setTauxTVA(new BigDecimal("20"));
        invoice.setLignes(List.of(
                new InvoiceLine("Développement", 10, new BigDecimal("100.00")),
                new InvoiceLine("Hébergement", 1, new BigDecimal("50.00"))
        ));

        invoiceService.calculerMontants(invoice);

        assertThat(invoice.getMontantHT()).isEqualByComparingTo("1050.00");
        assertThat(invoice.getMontantTTC()).isEqualByComparingTo("1260.00");
    }

    @Test
    void calculerMontants_arrondiAuCentimeLePlusProche() {
        Invoice invoice = new Invoice();
        invoice.setTauxTVA(new BigDecimal("20"));
        invoice.setLignes(List.of(new InvoiceLine("Prestation", 3, new BigDecimal("33.335"))));

        invoiceService.calculerMontants(invoice);

        assertThat(invoice.getMontantHT()).isEqualByComparingTo("100.01");
    }

    @Test
    void create_genereUnNumeroSequentielPrefixeParType() {
        Client client = unClient();
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
        when(invoiceRepository.countByTypeAndDateEmissionBetween(any(), any(), any())).thenReturn(6L);
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(inv -> inv.getArgument(0));

        InvoiceRequestDto dto = new InvoiceRequestDto(
                TypeInvoice.DEVIS, 1L, null,
                List.of(new InvoiceLineDto("Prestation", 1, new BigDecimal("100.00"))),
                new BigDecimal("20"), StatutInvoice.BROUILLON,
                LocalDate.of(2026, 3, 15), null
        );

        InvoiceResponseDto response = invoiceService.create(dto);

        assertThat(response.numero()).isEqualTo("DEV-2026-0007");
    }

    @Test
    void convertirEnFacture_refuseSiCeNestPasUnDevis() {
        Invoice facture = new Invoice();
        facture.setType(TypeInvoice.FACTURE);
        when(invoiceRepository.findById(5L)).thenReturn(Optional.of(facture));

        assertThatThrownBy(() -> invoiceService.convertirEnFacture(5L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("devis");
    }

    @Test
    void convertirEnFacture_creeUneNouvelleFactureAvecStatutBrouillon() {
        Client client = unClient();
        Invoice devis = new Invoice();
        devis.setType(TypeInvoice.DEVIS);
        devis.setClient(client);
        devis.setTauxTVA(new BigDecimal("20"));
        devis.setLignes(List.of(new InvoiceLine("Prestation", 2, new BigDecimal("500.00"))));
        when(invoiceRepository.findById(9L)).thenReturn(Optional.of(devis));
        when(invoiceRepository.countByTypeAndDateEmissionBetween(any(), any(), any())).thenReturn(0L);
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(inv -> inv.getArgument(0));

        InvoiceResponseDto facture = invoiceService.convertirEnFacture(9L);

        assertThat(facture.type()).isEqualTo(TypeInvoice.FACTURE);
        assertThat(facture.statut()).isEqualTo(StatutInvoice.BROUILLON);
        assertThat(facture.numero()).startsWith("FAC-");
        assertThat(facture.montantHT()).isEqualByComparingTo("1000.00");
    }

    @Test
    void findById_lanceResourceNotFoundExceptionSiInconnu() {
        when(invoiceRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> invoiceService.findById(404L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
