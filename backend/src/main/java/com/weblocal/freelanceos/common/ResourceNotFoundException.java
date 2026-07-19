package com.weblocal.freelanceos.common;

/**
 * Exception levée quand une ressource (Client, Project, Task, Invoice...)
 * demandée par son id n'existe pas en base.
 *
 * RuntimeException plutôt qu'une exception "checked" : on ne veut pas forcer
 * chaque appelant à écrire un try/catch. Elle sera interceptée globalement
 * par GlobalExceptionHandler et transformée en réponse HTTP 404.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
