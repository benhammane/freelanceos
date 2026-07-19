package com.weblocal.freelanceos.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;

import static org.springframework.security.config.Customizer.withDefaults;

/**
 * Configuration centrale de Spring Security.
 *
 * - @EnableWebSecurity : active la configuration de sécurité web de Spring Security.
 * - @EnableMethodSecurity : active les annotations @PreAuthorize("hasRole('ADMIN')")
 *   posées sur les contrôleurs existants (Client, Project, Task, Invoice, Dashboard),
 *   en plus des règles définies ici par URL.
 * - SessionCreationPolicy.STATELESS : indique à Spring Security de NE JAMAIS créer
 *   de session HTTP (pas de cookie JSESSIONID). Cohérent avec une authentification
 *   par JWT où chaque requête porte sa propre preuve d'identité dans l'en-tête
 *   Authorization.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        // BCrypt : algorithme de hachage à sens unique standard pour les mots de
        // passe, avec un "salt" intégré généré automatiquement à chaque hachage
        // (deux hachages du même mot de passe donnent des résultats différents).
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider(CustomUserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // CSRF protège contre les attaques exploitant les cookies de session ;
                // sans session (stateless, JWT dans un en-tête), ce risque ne s'applique
                // plus, donc on peut désactiver cette protection ici.
                .csrf(csrf -> csrf.disable())
                // Réutilise le bean CorsConfigurationSource défini dans CorsConfig,
                // pour que le frontend (origine différente) puisse appeler l'API.
                .cors(withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Les requêtes de pré-vérification CORS (OPTIONS) du navigateur ne
                        // portent jamais d'en-tête Authorization : elles doivent passer
                        // avant toute vérification d'authentification.
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Le login doit rester accessible sans être déjà authentifié...
                        .requestMatchers("/api/auth/**").permitAll()
                        // Le webhook Stripe est appelé par Stripe (pas d'utilisateur) : il
                        // est authentifié par la signature Stripe, pas par un JWT. La clé
                        // publique Stripe est, par nature, publique.
                        .requestMatchers("/api/payments/webhook", "/api/payments/public-key").permitAll()
                        // Le handshake WebSocket de signaling est protégé séparément par
                        // JwtHandshakeInterceptor (le JWT y est passé en query param, car
                        // un navigateur ne peut pas poser d'en-tête Authorization sur un WS).
                        .requestMatchers("/ws/**").permitAll()
                        // ...de même que la documentation Swagger, utile pour explorer l'API.
                        .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()
                        // Tout le reste de l'API exige d'être authentifié ; le détail fin
                        // (ADMIN vs CLIENT) est posé via @PreAuthorize sur chaque contrôleur.
                        .anyRequest().authenticated()
                )
                // Insère notre filtre JWT AVANT le filtre standard de Spring Security qui
                // gère l'authentification par formulaire (qu'on n'utilise pas ici, mais qui
                // reste présent par défaut dans la chaîne).
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
