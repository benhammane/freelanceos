package com.weblocal.freelanceos.common;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Classe mère pour toutes nos entités JPA (Client, Project, Task, Invoice...).
 * Centralise l'id technique et les dates d'audit pour éviter de les répéter
 * dans chaque entité.
 *
 * - @MappedSuperclass : indique à JPA/Hibernate que cette classe n'est PAS une
 *   entité à part entière (pas de table "base_entity" en base), mais que ses
 *   champs doivent être "hérités" par les tables des classes filles (Client,
 *   Project, etc.). C'est l'équivalent JPA de l'héritage Java classique.
 *
 * - @EntityListeners(AuditingEntityListener.class) : branche un "listener"
 *   Spring Data JPA qui remplit automatiquement createdAt/updatedAt lors des
 *   événements de persistance (avant insertion / avant mise à jour), grâce
 *   aux annotations @CreatedDate et @LastModifiedDate ci-dessous.
 */
@Getter
@Setter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreatedDate
    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;

    @LastModifiedDate
    @Column(name = "date_modification")
    private LocalDateTime dateModification;
}
