package com.weblocal.freelanceos.auth.dto;

import com.weblocal.freelanceos.auth.Role;

/**
 * clientId et clientNom ne sont renseignés que pour un utilisateur CLIENT :
 * le frontend s'en sert pour afficher "Bienvenue {clientNom}" sur le portail
 * et pour router vers l'espace admin ou l'espace client selon le rôle.
 */
public record LoginResponseDto(
        String token,
        Role role,
        String email,
        Long clientId,
        String clientNom
) {
}
