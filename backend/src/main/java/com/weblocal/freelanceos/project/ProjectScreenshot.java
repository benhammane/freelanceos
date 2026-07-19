package com.weblocal.freelanceos.project;

import com.weblocal.freelanceos.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Capture d'écran rattachée à un projet.
 *
 * On stocke directement les octets de l'image EN BASE (colonne binaire), plutôt
 * que sur le disque ou dans le cloud : l'application reste ainsi entièrement
 * autonome (rien à héberger ni configurer à côté), au prix d'une base un peu
 * plus volumineuse — acceptable pour un usage freelance avec quelques images
 * par projet.
 *
 * Relation UNIDIRECTIONNELLE : la capture connaît son projet (@ManyToOne), mais
 * l'entité Project n'a volontairement PAS de collection de captures. Ça évite
 * qu'un simple chargement de projet ne tire aussi tous les octets des images ;
 * les captures se manipulent uniquement via ProjectScreenshotRepository, par
 * projectId.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "project_screenshots")
public class ProjectScreenshot extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false)
    private String filename;

    /** Type MIME de l'image (ex : "image/png"), renvoyé tel quel au navigateur. */
    @Column(nullable = false)
    private String contentType;

    /**
     * Octets bruts de l'image. Un byte[] simple est mappé par Hibernate sur une
     * colonne PostgreSQL "bytea" : le contenu est lu avec la ligne, sans les
     * complications du mode "Large Object" (OID) qu'entraînerait @Lob ici.
     */
    @Column(nullable = false, columnDefinition = "bytea")
    private byte[] data;

    public ProjectScreenshot(Project project, String filename, String contentType, byte[] data) {
        this.project = project;
        this.filename = filename;
        this.contentType = contentType;
        this.data = data;
    }
}
