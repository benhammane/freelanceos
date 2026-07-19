package com.weblocal.freelanceos.message;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Canal WebSocket de la messagerie : sert uniquement à POUSSER les nouveaux
 * messages en temps réel vers les utilisateurs connectés (l'envoi/persistance
 * passe, lui, par les endpoints REST). On tient un registre des sessions par
 * userId ; MessageService appelle sendToUser(...) après avoir enregistré un
 * message pour notifier le destinataire (et ses autres onglets).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private final ObjectMapper objectMapper;

    private final Map<Long, Set<WebSocketSession>> sessionsByUser = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        Long userId = userIdOf(session);
        if (userId == null) {
            return;
        }
        sessionsByUser.computeIfAbsent(userId, k -> ConcurrentHashMap.newKeySet()).add(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        Long userId = userIdOf(session);
        if (userId == null) {
            return;
        }
        Set<WebSocketSession> sessions = sessionsByUser.get(userId);
        if (sessions != null) {
            sessions.remove(session);
            if (sessions.isEmpty()) {
                sessionsByUser.remove(userId);
            }
        }
    }

    /** Pousse un objet (sérialisé en JSON) à toutes les sessions ouvertes d'un utilisateur. */
    public void sendToUser(Long userId, Object payload) {
        if (userId == null) {
            return;
        }
        Set<WebSocketSession> sessions = sessionsByUser.get(userId);
        if (sessions == null) {
            return;
        }
        String text;
        try {
            text = objectMapper.writeValueAsString(payload);
        } catch (IOException e) {
            log.warn("Sérialisation d'un événement chat impossible : {}", e.getMessage());
            return;
        }
        for (WebSocketSession session : sessions) {
            if (session.isOpen()) {
                try {
                    synchronized (session) {
                        session.sendMessage(new TextMessage(text));
                    }
                } catch (IOException e) {
                    log.warn("Échec d'envoi d'un message chat à {} : {}", session.getId(), e.getMessage());
                }
            }
        }
    }

    private static Long userIdOf(WebSocketSession session) {
        return (Long) session.getAttributes().get("userId");
    }
}
