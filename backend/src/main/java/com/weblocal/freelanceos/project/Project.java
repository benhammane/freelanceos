package com.weblocal.freelanceos.project;

import com.weblocal.freelanceos.client.Client;
import com.weblocal.freelanceos.common.BaseEntity;
import com.weblocal.freelanceos.common.Priorite;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Entité JPA représentant un projet freelance, rattaché à un client.
 *
 * - @ManyToOne : plusieurs Project peuvent pointer vers le même Client
 *   (relation "plusieurs vers un"). @JoinColumn précise le nom de la colonne
 *   de clé étrangère créée dans la table "projects".
 * - FetchType.LAZY : le client associé n'est chargé depuis la base QUE
 *   lorsqu'on appelle explicitement project.getClient() (accès différé).
 *   C'est le comportement recommandé pour les relations @ManyToOne/@OneToMany
 *   afin d'éviter de charger inutilement des données non utilisées (par
 *   exemple quand on liste juste les projets sans avoir besoin du détail client).
 * - @Enumerated(EnumType.STRING) : stocke l'enum sous forme de texte lisible
 *   en base plutôt que sous forme d'entier positionnel.
 * - @ElementCollection : "technos" est une simple liste de chaînes de
 *   caractères (pas une entité à part entière). JPA crée automatiquement une
 *   table annexe "project_technos" avec une clé étrangère vers "projects".
 * - "position" sert à ordonner les cartes à l'intérieur d'une même colonne du
 *   Kanban (mis à jour par le frontend lors d'un drag-and-drop).
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "projects")
public class Project extends BaseEntity {

    @Column(nullable = false)
    private String titre;

    @Column(length = 2000)
    private String description;

    /**
     * Lien vers le projet en ligne (site déployé, maquette, préversion…).
     * Optionnel, visible aussi par le client dans son portail.
     */
    @Column(length = 500)
    private String url;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutProjet statut;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priorite priorite;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ElementCollection
    @CollectionTable(name = "project_technos", joinColumns = @JoinColumn(name = "project_id"))
    @Column(name = "techno")
    private List<String> technos = new ArrayList<>();

    private LocalDate dateDebut;

    private LocalDate dateFinPrevue;

    private BigDecimal montantEstime;

    @Column(nullable = false)
    private int position;
}
