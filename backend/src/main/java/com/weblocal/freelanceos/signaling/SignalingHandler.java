package com.weblocal.freelanceos.signaling;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Serveur de signaling WebRTC.
 *
 * WebRTC établit des flux audio/vidéo directement entre navigateurs (pair-à-pair),
 * mais avant cela les pairs doivent s'échanger des métadonnées de connexion :
 * les "offres"/"réponses" SDP (description des flux) et les "candidats ICE"
 * (chemins réseau possibles). Ce serveur ne fait QUE relayer ces messages entre
 * participants d'une même salle : il ne voit jamais l'audio/vidéo, qui transite
 * directement entre les navigateurs.
 *
 * Topologie en "mesh" : chaque participant ouvre une connexion directe avec
 * chacun des autres. Adapté aux petites réunions (2 à 4 personnes).
 *
 * Protocole de messages (JSON) :
 *  - Serveur -> client à l'arrivée : {type:"welcome", peerId, peers:[...]}
 *  - Serveur -> autres             : {type:"peer-joined", peerId}
 *  - Client -> serveur (relais)    : {type:"offer"|"answer"|"ice-candidate", target, payload}
 *  - Serveur -> cible              : idem + {from: peerId émetteur}
 *  - Serveur -> autres au départ   : {type:"peer-left", peerId}
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SignalingHandler extends TextWebSocketHandler {

    private final ObjectMapper objectMapper;

    /** roomId -> (sessionId -> session). Un sessionId sert de "peerId" unique. */
    private final Map<String, Map<String, WebSocketSession>> rooms = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String roomId = roomIdOf(session);
        String peerId = session.getId();

        Map<String, WebSocketSession> room = rooms.computeIfAbsent(roomId, k -> new ConcurrentHashMap<>());

        // On informe le nouvel arrivant de la liste des pairs déjà présents : c'est
        // LUI qui initiera les offres vers eux (règle simple qui évite les collisions
        // d'offres simultanées, dites "glare").
        ObjectNode welcome = objectMapper.createObjectNode();
        welcome.put("type", "welcome");
        welcome.put("peerId", peerId);
        welcome.set("peers", objectMapper.valueToTree(room.keySet()));
        send(session, welcome);

        // On prévient les pairs déjà présents qu'un nouveau participant est arrivé.
        ObjectNode joined = objectMapper.createObjectNode();
        joined.put("type", "peer-joined");
        joined.put("peerId", peerId);
        broadcast(room, peerId, joined);

        room.put(peerId, session);
        log.info("Peer {} a rejoint la salle {} ({} participant(s))", peerId, roomId, room.size());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String roomId = roomIdOf(session);
        Map<String, WebSocketSession> room = rooms.get(roomId);
        if (room == null) {
            return;
        }

        JsonNode msg = objectMapper.readTree(message.getPayload());
        String type = msg.path("type").asText();
        String target = msg.path("target").asText(null);

        // Les messages offer/answer/ice-candidate sont adressés à un pair précis :
        // on les relaie tels quels en ajoutant l'identité de l'émetteur.
        if (target != null && ("offer".equals(type) || "answer".equals(type) || "ice-candidate".equals(type))) {
            WebSocketSession targetSession = room.get(target);
            if (targetSession != null && targetSession.isOpen()) {
                ObjectNode relay = (ObjectNode) msg;
                relay.put("from", session.getId());
                send(targetSession, relay);
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String roomId = roomIdOf(session);
        String peerId = session.getId();
        Map<String, WebSocketSession> room = rooms.get(roomId);
        if (room == null) {
            return;
        }

        room.remove(peerId);

        ObjectNode left = objectMapper.createObjectNode();
        left.put("type", "peer-left");
        left.put("peerId", peerId);
        broadcast(room, peerId, left);

        if (room.isEmpty()) {
            rooms.remove(roomId);
        }
        log.info("Peer {} a quitté la salle {} ({} participant(s) restant(s))", peerId, roomId, room.size());
    }

    private void broadcast(Map<String, WebSocketSession> room, String excludePeerId, ObjectNode payload) {
        room.forEach((peerId, session) -> {
            if (!peerId.equals(excludePeerId) && session.isOpen()) {
                send(session, payload);
            }
        });
    }

    /**
     * Envoi thread-safe : une WebSocketSession n'accepte pas d'écritures
     * concurrentes, on synchronise donc sur la session.
     */
    private void send(WebSocketSession session, ObjectNode payload) {
        try {
            String text = objectMapper.writeValueAsString(payload);
            synchronized (session) {
                session.sendMessage(new TextMessage(text));
            }
        } catch (IOException e) {
            log.warn("Échec de l'envoi d'un message de signaling à {}: {}", session.getId(), e.getMessage());
        }
    }

    private static String roomIdOf(WebSocketSession session) {
        return (String) session.getAttributes().get("roomId");
    }
}
