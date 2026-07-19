package com.weblocal.freelanceos.project;

/**
 * Projection "fermée" Spring Data : quand un repository renvoie ce type,
 * Spring Data génère une requête SQL qui NE SÉLECTIONNE QUE ces trois colonnes
 * (id, filename, contentType) — surtout PAS la colonne binaire "data". On peut
 * donc lister les métadonnées des captures d'un projet sans jamais charger les
 * octets des images en mémoire.
 */
public interface ScreenshotMeta {
    Long getId();

    String getFilename();

    String getContentType();
}
