package com.weblocal.freelanceos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Point d'entrée de l'application Spring Boot.
 *
 * L'annotation @SpringBootApplication est en réalité un raccourci qui combine
 * trois annotations :
 *   - @Configuration      : cette classe peut définir des beans (objets gérés par Spring)
 *   - @EnableAutoConfiguration : Spring Boot configure automatiquement plein de choses
 *                                (serveur Tomcat, JPA, etc.) selon les dépendances trouvées
 *                                dans le pom.xml. C'est ce qui évite d'écrire du XML
 *                                de configuration comme dans les vieux projets Spring.
 *   - @ComponentScan      : Spring va scanner ce package (com.weblocal.freelanceos) et
 *                           tous ses sous-packages pour détecter les classes annotées
 *                           (@Service, @RestController, @Repository...) et les enregistrer
 *                           automatiquement dans le "contexte d'application" (le conteneur
 *                           qui gère l'injection de dépendances).
 */
@SpringBootApplication
// Active le remplissage automatique des champs @CreatedDate/@LastModifiedDate
// de BaseEntity via AuditingEntityListener.
@EnableJpaAuditing
public class FreelanceOsApplication {

    public static void main(String[] args) {
        SpringApplication.run(FreelanceOsApplication.class, args);
    }
}
