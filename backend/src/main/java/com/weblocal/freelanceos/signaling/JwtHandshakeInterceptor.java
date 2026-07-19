package com.weblocal.freelanceos.signaling;

import com.weblocal.freelanceos.auth.JwtService;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;

/**
 * Sécurise l'ouverture d'une connexion WebSocket de signaling.
 *
 * Un navigateur ne peut pas poser d'en-tête "Authorization: Bearer <token>" sur
 * une connexion WebSocket ; on transmet donc le JWT en paramètre de requête
 * (?token=...&roomId=...). Cet intercepteur valide le token AVANT que la
 * connexion ne soit établie : si le token est absent ou invalide, le handshake
 * est refusé (retour false => réponse 401/403). Les informations utiles
 * (userId, email, roomId) sont placées dans les attributs de session pour être
 * relues par le SignalingHandler.
 */
@Component
@RequiredArgsConstructor
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtService jwtService;

    @Override
    public boolean beforeHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes
    ) {
        var params = UriComponentsBuilder.fromUri(request.getURI()).build().getQueryParams();
        String token = first(params.get("token"));
        String roomId = first(params.get("roomId")); // optionnel (utilisé par la visio)

        if (token == null) {
            return false;
        }

        Claims claims = jwtService.validerEtExtraire(token);
        if (claims == null) {
            return false;
        }

        Number userId = claims.get("userId", Number.class);
        Number clientId = claims.get("clientId", Number.class);
        attributes.put("userId", userId != null ? userId.longValue() : null);
        attributes.put("clientId", clientId != null ? clientId.longValue() : null);
        attributes.put("role", claims.get("role", String.class));
        attributes.put("email", claims.getSubject());
        if (roomId != null) {
            attributes.put("roomId", roomId);
        }
        return true;
    }

    @Override
    public void afterHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Exception exception
    ) {
        // Rien à faire après le handshake.
    }

    private static String first(List<String> values) {
        return (values != null && !values.isEmpty()) ? values.get(0) : null;
    }
}
