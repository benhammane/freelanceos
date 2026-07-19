package com.weblocal.freelanceos.signaling;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * Enregistre le endpoint WebSocket de signaling sur /ws/signaling.
 *
 * Le handshake est protégé par JwtHandshakeInterceptor (le JWT est passé en
 * query param). Les origines autorisées reprennent celles du CORS HTTP
 * (frontend local + domaines Vercel).
 */
@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final SignalingHandler signalingHandler;
    private final JwtHandshakeInterceptor jwtHandshakeInterceptor;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(signalingHandler, "/ws/signaling")
                .addInterceptors(jwtHandshakeInterceptor)
                .setAllowedOriginPatterns(
                        "http://localhost:5173",
                        "https://freelanceos-henna-nu.vercel.app",
                        "https://freelanceos-*.vercel.app"
                );
    }
}
