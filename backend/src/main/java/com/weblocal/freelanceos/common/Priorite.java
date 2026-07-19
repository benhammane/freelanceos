package com.weblocal.freelanceos.common;

/**
 * Niveau de priorité, partagé entre Project et Task (mêmes valeurs pour les deux).
 *
 * Un enum Java mappé par JPA avec @Enumerated(EnumType.STRING) (voir Project et
 * Task) est stocké en base sous forme de texte ("HAUTE", "MOYENNE"...) plutôt
 * que sous forme d'index numérique (0, 1, 2...). C'est important : si on
 * réordonne ou insère une valeur dans l'enum plus tard, les données déjà en
 * base restent correctes puisqu'elles ne dépendent pas de l'ordre déclaré.
 */
public enum Priorite {
    BASSE,
    MOYENNE,
    HAUTE
}
