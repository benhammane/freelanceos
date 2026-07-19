package com.weblocal.freelanceos.auth;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Il n'existe aucun écran d'inscription dans cette application (un seul
 * freelance l'utilise) : au tout premier démarrage, ce composant crée
 * automatiquement le compte ADMIN à partir de app.admin.email/app.admin.password
 * (voir application.yml) si aucun utilisateur n'existe encore en base.
 *
 * CommandLineRunner : interface Spring Boot dont la méthode run() est
 * exécutée automatiquement une fois, juste après le démarrage complet de
 * l'application (tous les beans initialisés).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AdminBootstrap implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        if (userRepository.existsByEmail(adminEmail)) {
            return;
        }

        User admin = new User();
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);

        log.warn("Compte ADMIN créé automatiquement ({}) - pense à changer app.admin.password en production !", adminEmail);
    }
}
