package com.weblocal.freelanceos.auth;

/**
 * Représente l'utilisateur authentifié pour la requête HTTP en cours, extrait
 * directement du JWT (voir JwtAuthenticationFilter) sans retour en base.
 * Récupérable dans un contrôleur via @AuthenticationPrincipal AuthenticatedUser.
 * clientId est null pour un ADMIN (qui n'est rattaché à aucun client).
 */
public record AuthenticatedUser(Long userId, String email, Role role, Long clientId) {
}
