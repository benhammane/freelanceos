package com.weblocal.freelanceos.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration de la documentation OpenAPI (Swagger).
 *
 * La dépendance springdoc-openapi-starter-webmvc-ui (voir pom.xml) génère
 * automatiquement la documentation de TOUS les endpoints REST détectés
 * (@RestController) sans configuration supplémentaire. Ce bean sert juste à
 * personnaliser le titre/la description affichés sur la page Swagger UI.
 *
 * Un "bean" est un objet dont la création et le cycle de vie sont gérés par
 * Spring (le "conteneur IoC" - Inversion of Control). Ici, on déclare une
 * méthode annotée @Bean : Spring va l'appeler une fois au démarrage et
 * garder l'objet OpenAPI résultant en mémoire pour l'utiliser partout où
 * c'est nécessaire (injection de dépendances).
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI freelanceOsOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("FreelanceOS API")
                        .description("API REST pour la gestion d'activité freelance : clients, projets, tâches, devis/factures.")
                        .version("v0.1.0"));
    }
}
