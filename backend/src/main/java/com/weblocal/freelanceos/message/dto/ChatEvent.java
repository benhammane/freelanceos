package com.weblocal.freelanceos.message.dto;

/**
 * Enveloppe d'un événement poussé sur le WebSocket de chat. Le champ "type"
 * permet au frontend d'aiguiller (aujourd'hui uniquement "message").
 */
public record ChatEvent(String type, MessageDto message) {}
