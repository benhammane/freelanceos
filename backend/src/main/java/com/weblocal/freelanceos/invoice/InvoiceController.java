package com.weblocal.freelanceos.invoice;

import com.weblocal.freelanceos.invoice.dto.InvoiceRequestDto;
import com.weblocal.freelanceos.invoice.dto.InvoiceResponseDto;
import com.weblocal.freelanceos.invoice.dto.InvoiceStatutDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@Tag(name = "Devis / Factures", description = "Gestion des devis et factures, calculs HT/TVA/TTC, export PDF")
@PreAuthorize("hasRole('ADMIN')")
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping
    public List<InvoiceResponseDto> findAll() {
        return invoiceService.findAll();
    }

    @GetMapping("/{id}")
    public InvoiceResponseDto findById(@PathVariable Long id) {
        return invoiceService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InvoiceResponseDto create(@Valid @RequestBody InvoiceRequestDto dto) {
        return invoiceService.create(dto);
    }

    @PutMapping("/{id}")
    public InvoiceResponseDto update(@PathVariable Long id, @Valid @RequestBody InvoiceRequestDto dto) {
        return invoiceService.update(id, dto);
    }

    @PatchMapping("/{id}/statut")
    public InvoiceResponseDto changerStatut(@PathVariable Long id, @Valid @RequestBody InvoiceStatutDto dto) {
        return invoiceService.changerStatut(id, dto);
    }

    @PostMapping("/{id}/convertir-en-facture")
    public InvoiceResponseDto convertirEnFacture(@PathVariable Long id) {
        return invoiceService.convertirEnFacture(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        invoiceService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Renvoie le PDF en binaire brut. ResponseEntity<byte[]> plutôt qu'un DTO :
     * on contrôle explicitement le Content-Type (application/pdf) et l'en-tête
     * Content-Disposition qui indique au navigateur de proposer un
     * téléchargement avec un nom de fichier basé sur le numéro du document.
     */
    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> telechargerPdf(@PathVariable Long id) {
        InvoiceResponseDto invoice = invoiceService.findById(id);
        byte[] pdf = invoiceService.genererPdf(id);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + invoice.numero() + ".pdf\"")
                .body(pdf);
    }
}
