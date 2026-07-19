package com.weblocal.freelanceos.signaling;

import com.weblocal.freelanceos.message.ChatWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * Enregistre les endpoints WebSocket :
 *  - /ws/signaling : signaling WebRTC pour la visioconférence
 *  - /ws/chat      : messagerie temps réel client / freelance
 *
 * Les deux handshakes sont protégés par JwtHandshakeInterceptor (JWT en query
 * param). Les origines autorisées reprennent celles du CORS HTTP.
 */
@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private static final String[] ALLOWED_ORIGINS = {
            "http://localhost:5173",
            "https://freelanceos-henna-nu.vercel.app",
            "https://freelanceos-*.vercel.app"
    };

    private final SignalingHandler signalingHandler;
    private final ChatWebSocketHandler chatWebSocketHandler;
    private final JwtHandshakeInterceptor jwtHandshakeInterceptor;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(signalingHandler, "/ws/signaling")
                .addInterceptors(jwtHandshakeInterceptor)
                .setAllowedOriginPatterns(ALLOWED_ORIGINS);

        registry.addHandler(chatWebSocketHandler, "/ws/chat")
                .addInterceptors(jwtHandshakeInterceptor)
                .setAllowedOriginPatterns(ALLOWED_ORIGINS);
    }
}
