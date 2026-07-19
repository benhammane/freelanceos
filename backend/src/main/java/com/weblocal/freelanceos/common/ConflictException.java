package com.weblocal.freelanceos.common;

/**
 * Exception levée quand une suppression est refusée à cause d'une règle
 * métier (ex : un client encore lié à des projets ou factures), par
 * opposition à ResourceNotFoundException qui signale une ressource absente.
 * Traduite en HTTP 409 Conflict par GlobalExceptionHandler.
 */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
