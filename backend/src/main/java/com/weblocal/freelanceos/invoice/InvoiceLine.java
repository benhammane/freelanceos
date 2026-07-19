package com.weblocal.freelanceos.invoice;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Ligne d'un devis/facture (une prestation avec sa quantité et son prix).
 *
 * @Embeddable : contrairement à @Entity, ce type n'a pas d'existence ni
 * d'identifiant propre en base de données. C'est un simple regroupement de
 * colonnes qui sera "aplati" dans une table annexe via @ElementCollection
 * sur Invoice.lignes. On l'utilise ici parce que les lignes n'ont de sens
 * qu'à l'intérieur d'un devis/facture précis (pas besoin de les manipuler
 * ou de les rechercher indépendamment).
 */
@Getter
@Setter
@NoArgsConstructor
@Embeddable
public class InvoiceLine {

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private int quantite;

    @Column(nullable = false)
    private BigDecimal prixUnitaire;

    public InvoiceLine(String description, int quantite, BigDecimal prixUnitaire) {
        this.description = description;
        this.quantite = quantite;
        this.prixUnitaire = prixUnitaire;
    }

    /**
     * Montant HT de cette seule ligne (quantité * prix unitaire).
     * BigDecimal est utilisé (plutôt que double/float) pour tous les calculs
     * monétaires de l'application : contrairement aux flottants binaires,
     * il ne souffre pas d'erreurs d'arrondi (ex: 0.1 + 0.2 != 0.3 en double),
     * ce qui est indispensable dès qu'on manipule de l'argent.
     */
    public BigDecimal montantLigne() {
        return prixUnitaire.multiply(BigDecimal.valueOf(quantite));
    }
}
