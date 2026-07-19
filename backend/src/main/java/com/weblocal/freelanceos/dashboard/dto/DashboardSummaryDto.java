package com.weblocal.freelanceos.dashboard.dto;

import java.math.BigDecimal;

/**
 * Cartes de synthèse affichées sur le Dashboard. Les calculs analytiques plus
 * poussés (courbes d'évolution, prévisions...) sont prévus pour une phase
 * ultérieure ; ceci reste volontairement une agrégation basique.
 */
public record DashboardSummaryDto(
        long nombreClients,
        long projetsEnCours,
        BigDecimal chiffreAffairesMois,
        BigDecimal montantFacturesImpayees
) {
}
