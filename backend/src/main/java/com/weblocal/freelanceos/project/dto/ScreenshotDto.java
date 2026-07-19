package com.weblocal.freelanceos.project.dto;

/**
 * Métadonnées d'une capture d'écran renvoyées dans les réponses de l'API
 * (jamais les octets). Le frontend construit l'URL de l'image à partir de l'id
 * et la récupère via un appel authentifié séparé.
 */
public record ScreenshotDto(
        Long id,
        String filename,
        String contentType
) {
}
