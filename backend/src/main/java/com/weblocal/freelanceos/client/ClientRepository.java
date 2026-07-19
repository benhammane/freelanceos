package com.weblocal.freelanceos.client;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository Spring Data JPA pour l'entité Client.
 *
 * @Repository : marque cette interface comme un composant Spring gérant l'accès
 * aux données (Spring en fait un "bean" injectable, et traduit aussi les
 * exceptions bas niveau du driver JDBC en exceptions Spring uniformes).
 *
 * En étendant JpaRepository<Client, Long>, on récupère GRATUITEMENT, sans écrire
 * une seule ligne de SQL, toutes les opérations CRUD de base :
 * save(), findById(), findAll(), deleteById(), existsById(), etc.
 * Spring Data JPA génère l'implémentation concrète de cette interface au
 * démarrage de l'application (via un mécanisme de proxy).
 *
 * <Client, Long> : Client = type de l'entité gérée, Long = type de sa clé primaire.
 */
@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
}
