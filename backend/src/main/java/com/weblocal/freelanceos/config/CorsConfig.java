package com.weblocal.freelanceos.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Configuration CORS (Cross-Origin Resource Sharing).
 *
 * Le frontend React (servi par Vite sur http://localhost:5173) et le backend
 * Spring Boot (http://localhost:8080) tournent sur des ports différents.
 * Par défaut, un navigateur bloque les requêtes JavaScript entre deux "origines"
 * différentes (protocole + domaine + port) pour des raisons de sécurité : c'est
 * la politique "same-origin". CORS est le mécanisme qui permet d'autoriser
 * explicitement certaines origines à appeler notre API.
 *
 * On expose ici un bean CorsConfigurationSource (plutôt qu'un simple
 * WebMvcConfigurer) car c'est la forme que Spring SECURITY sait aller
 * chercher automatiquement (voir SecurityConfig, .cors(withDefaults())).
 * Avec Spring Security dans la chaîne de filtres, une configuration CORS
 * qui ne passerait que par Spring MVC ne suffirait plus : Security
 * intercepte les requêtes AVANT que MVC ne les voie.
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
