package com.weblocal.freelanceos.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Implémentation de l'interface UserDetailsService attendue par Spring
 * Security : lui indique COMMENT retrouver un utilisateur à partir de son
 * identifiant (ici, son email) dans notre base. Utilisée uniquement au
 * moment du login (voir AuthController) — pour les requêtes suivantes,
 * l'authentification se fait via le JWT sans retourner en base
 * (voir JwtAuthenticationFilter).
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Aucun utilisateur avec l'email : " + email));
    }
}
