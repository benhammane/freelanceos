package com.weblocal.freelanceos.invoice;

/**
 * Un devis (DEVIS) et une facture (FACTURE) partagent exactement la même
 * structure de données (lignes, montants, client...) — seul ce champ "type"
 * les distingue, ainsi que le préfixe utilisé pour numéroter le document
 * (voir InvoiceService.genererNumero).
 */
public enum TypeInvoice {
    DEVIS,
    FACTURE
}
