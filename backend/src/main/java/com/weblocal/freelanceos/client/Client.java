package com.weblocal.freelanceos.client;

import com.weblocal.freelanceos.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entité JPA représentant un client de l'activité freelance.
 *
 * - @Entity : dit à Hibernate (l'implémentation JPA utilisée par Spring Data JPA)
 *   que cette classe correspond à une table en base de données. Sans le driver
 *   PostgreSQL + spring-boot-starter-data-jpa (voir pom.xml), cette annotation
 *   n'aurait aucun effet.
 * - @Table(name = "clients") : précise explicitement le nom de la table (sinon
 *   Hibernate en déduirait un nom à partir du nom de la classe).
 * - @Getter/@Setter/@NoArgsConstructor (Lombok) : génèrent à la compilation les
 *   getters, setters et un constructeur sans arguments (requis par JPA pour
 *   pouvoir instancier l'entité via réflexion lors du chargement depuis la BDD).
 *
 * On hérite de BaseEntity qui apporte déjà : id, dateCreation, dateModification.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "clients")
public class Client extends BaseEntity {

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String email;

    private String entreprise;

    private String telephone;

    @Column(length = 500)
    private String adresse;

    @Column(length = 2000)
    private String notes;
}
