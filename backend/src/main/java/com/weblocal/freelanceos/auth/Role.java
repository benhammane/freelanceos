package com.weblocal.freelanceos.auth;

/**
 * Les deux seuls rôles de l'application :
 *  - ADMIN : toi (le freelance), accès complet à toute l'API existante.
 *  - CLIENT : un client, accès en LECTURE SEULE limité à ses propres
 *    projets et devis/factures via le portail (voir le package "portal").
 */
public enum Role {
    ADMIN,
    CLIENT
}
