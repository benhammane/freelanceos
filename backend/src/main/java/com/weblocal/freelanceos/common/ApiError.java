package com.weblocal.freelanceos.common;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Format générique de réponse d'erreur renvoyé par l'API à chaque exception
 * interceptée par GlobalExceptionHandler. Un "record" Java (depuis Java 16)
 * est une classe immuable très concise : le compilateur génère automatiquement
 * le constructeur, les getters, equals/hashCode et toString à partir des champs
 * déclarés entre parenthèses. Idéal pour des objets de transport de données
 * simples comme celui-ci.
 */
public record ApiError(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        List<String> details
) {
}
