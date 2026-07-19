package com.weblocal.freelanceos.client.dto;

/**
 * Renvoyé UNE SEULE FOIS juste après la génération d'un accès portail pour
 * un client : le mot de passe en clair n'est jamais stocké ni renvoyé à
 * nouveau ensuite (seul son hash BCrypt reste en base). À toi de le
 * communiquer au client par le moyen de ton choix.
 */
public record ClientAccessResponseDto(
        String email,
        String motDePasseGenere
) {
}
