package com.weblocal.freelanceos.auth;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Filtre exécuté une fois par requête (OncePerRequestFilter), placé AVANT le
 * filtre standard de Spring Security dans la chaîne (voir SecurityConfig).
 * Son rôle : lire l'en-tête "Authorization: Bearer <token>", valider le JWT,
 * et si valide, peupler le SecurityContext avec un utilisateur authentifié
 * pour le reste du traitement de la requête (contrôleurs, @PreAuthorize...).
 *
 * Si l'en-tête est absent ou le token invalide, on laisse simplement la
 * requête continuer SANS authentification : c'est ensuite la configuration
 * de SecurityConfig (quelles routes exigent quel rôle) qui décide de
 * refuser ou non l'accès.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String PREFIXE_BEARER = "Bearer ";

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        String enTete = request.getHeader("Authorization");

        if (enTete != null && enTete.startsWith(PREFIXE_BEARER)) {
            String token = enTete.substring(PREFIXE_BEARER.length());
            Claims claims = jwtService.validerEtExtraire(token);

            if (claims != null) {
                Role role = Role.valueOf(claims.get("role", String.class));
                // Number.class plutôt que Long.class : selon la taille de la valeur,
                // Jackson désérialise parfois un entier JSON en Integer plutôt qu'en
                // Long, et claims.get(key, Long.class) échouerait alors par un
                // ClassCastException. Number couvre les deux cas sans ambiguïté.
                Long userId = toLong(claims.get("userId", Number.class));
                Long clientId = toLong(claims.get("clientId", Number.class));

                AuthenticatedUser principal = new AuthenticatedUser(userId, claims.getSubject(), role, clientId);
                var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
                var authentication = new UsernamePasswordAuthenticationToken(principal, null, authorities);

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }

    private static Long toLong(Number nombre) {
        return nombre != null ? nombre.longValue() : null;
    }
}
