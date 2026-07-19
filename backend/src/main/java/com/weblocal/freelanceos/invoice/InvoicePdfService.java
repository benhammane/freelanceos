package com.weblocal.freelanceos.invoice;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

/**
 * Génère le PDF d'un devis ou d'une facture avec OpenPDF (fork libre et
 * maintenu de la librairie iText, dépendance "com.github.librepdf:openpdf"
 * dans le pom.xml — remarque : le nom de ses packages Java reste
 * "com.lowagie.text", hérité de la bibliothèque historique dont OpenPDF est issu).
 *
 * Le document est construit "bas niveau" : on crée des paragraphes et des
 * tableaux (PdfPTable) qu'on ajoute un par un au document, ce qui est le
 * fonctionnement normal de cette librairie (pas de templating HTML->PDF ici).
 */
@Service
public class InvoicePdfService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public byte[] genererPdf(Invoice invoice) {
        Document document = new Document(PageSize.A4, 40, 40, 50, 50);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            ajouterEnTete(document, invoice);
            ajouterInfosClient(document, invoice);
            ajouterTableauLignes(document, invoice);
            ajouterTotaux(document, invoice);

            document.close();
        } catch (DocumentException e) {
            throw new IllegalStateException("Erreur lors de la génération du PDF", e);
        }

        return out.toByteArray();
    }

    private void ajouterEnTete(Document document, Invoice invoice) throws DocumentException {
        String libelleType = invoice.getType() == TypeInvoice.DEVIS ? "DEVIS" : "FACTURE";

        Font titreFont = new Font(Font.HELVETICA, 22, Font.BOLD, new Color(0x16, 0x32, 0x4f));
        Paragraph titre = new Paragraph(libelleType + " N° " + invoice.getNumero(), titreFont);
        titre.setSpacingAfter(4);
        document.add(titre);

        Font dateFont = new Font(Font.HELVETICA, 10, Font.NORMAL, Color.DARK_GRAY);
        Paragraph date = new Paragraph(
                "Émis le " + invoice.getDateEmission().format(DATE_FORMAT) +
                        (invoice.getDateEcheance() != null
                                ? "  —  Échéance le " + invoice.getDateEcheance().format(DATE_FORMAT)
                                : ""),
                dateFont
        );
        date.setSpacingAfter(20);
        document.add(date);
    }

    private void ajouterInfosClient(Document document, Invoice invoice) throws DocumentException {
        Font labelFont = new Font(Font.HELVETICA, 11, Font.BOLD);
        Font valueFont = new Font(Font.HELVETICA, 11, Font.NORMAL);

        Paragraph clientTitre = new Paragraph("Client", labelFont);
        clientTitre.setSpacingAfter(4);
        document.add(clientTitre);

        document.add(new Paragraph(invoice.getClient().getNom(), valueFont));
        if (invoice.getClient().getEntreprise() != null && !invoice.getClient().getEntreprise().isBlank()) {
            document.add(new Paragraph(invoice.getClient().getEntreprise(), valueFont));
        }
        if (invoice.getClient().getAdresse() != null && !invoice.getClient().getAdresse().isBlank()) {
            document.add(new Paragraph(invoice.getClient().getAdresse(), valueFont));
        }
        document.add(new Paragraph(invoice.getClient().getEmail(), valueFont));

        Paragraph espace = new Paragraph(" ");
        espace.setSpacingAfter(10);
        document.add(espace);
    }

    private void ajouterTableauLignes(Document document, Invoice invoice) throws DocumentException {
        PdfPTable table = new PdfPTable(new float[]{4f, 1f, 1.5f, 1.5f});
        table.setWidthPercentage(100);
        table.setSpacingBefore(10);
        table.setSpacingAfter(10);

        Color entete = new Color(0x16, 0x32, 0x4f);
        Font enteteFont = new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE);

        ajouterCelluleEntete(table, "Description", enteteFont, entete);
        ajouterCelluleEntete(table, "Qté", enteteFont, entete);
        ajouterCelluleEntete(table, "Prix unitaire", enteteFont, entete);
        ajouterCelluleEntete(table, "Montant", enteteFont, entete);

        Font cellFont = new Font(Font.HELVETICA, 10, Font.NORMAL);
        for (InvoiceLine ligne : invoice.getLignes()) {
            table.addCell(new PdfPCell(new Phrase(ligne.getDescription(), cellFont)));
            table.addCell(new PdfPCell(new Phrase(String.valueOf(ligne.getQuantite()), cellFont)));
            table.addCell(new PdfPCell(new Phrase(formaterMontant(ligne.getPrixUnitaire()), cellFont)));
            table.addCell(new PdfPCell(new Phrase(formaterMontant(ligne.montantLigne()), cellFont)));
        }

        document.add(table);
    }

    private void ajouterCelluleEntete(PdfPTable table, String texte, Font font, Color fond) {
        PdfPCell cell = new PdfPCell(new Phrase(texte, font));
        cell.setBackgroundColor(fond);
        cell.setPadding(6);
        table.addCell(cell);
    }

    private void ajouterTotaux(Document document, Invoice invoice) throws DocumentException {
        Font labelFont = new Font(Font.HELVETICA, 11, Font.NORMAL);
        Font totalFont = new Font(Font.HELVETICA, 13, Font.BOLD, new Color(0x2E, 0x7C, 0xF6));

        Paragraph ht = new Paragraph("Total HT : " + formaterMontant(invoice.getMontantHT()) + " €", labelFont);
        ht.setAlignment(Element.ALIGN_RIGHT);
        document.add(ht);

        Paragraph tva = new Paragraph("TVA (" + invoice.getTauxTVA() + " %)", labelFont);
        tva.setAlignment(Element.ALIGN_RIGHT);
        document.add(tva);

        Paragraph ttc = new Paragraph("Total TTC : " + formaterMontant(invoice.getMontantTTC()) + " €", totalFont);
        ttc.setAlignment(Element.ALIGN_RIGHT);
        ttc.setSpacingBefore(8);
        document.add(ttc);
    }

    private String formaterMontant(java.math.BigDecimal montant) {
        return montant.setScale(2, java.math.RoundingMode.HALF_UP).toString();
    }
}
