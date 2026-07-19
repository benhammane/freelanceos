package com.weblocal.freelanceos.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Génère et valide les tokens JWT (JSON Web Token).
 *
 * Principe d'une authentification "stateless" par JWT : au login, le serveur
 * génère un token signé contenant les informations nécessaires (ici : email,
 * rôle, id du client le cas échéant) et le renvoie au frontend. Pour chaque
 * requête suivante, le frontend renvoie ce token dans l'en-tête
 * "Authorization: Bearer <token>". Le serveur vérifie juste la SIGNATURE du
 * token (avec la même clé secrète) : si elle est valide, il fait confiance
 * au contenu SANS avoir besoin de retourner en base ni de maintenir une
 * session côté serveur — d'où "stateless".
 */
@Service
public class JwtService {

    private final SecretKey cle;
    private final long dureeValiditeMs;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long dureeValiditeMs
    ) {
        this.cle = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.dureeValiditeMs = dureeValiditeMs;
    }

    public String genererToken(User user) {
        Date maintenant = new Date();
        Date expiration = new Date(maintenant.getTime() + dureeValiditeMs);

        var builder = Jwts.builder()
                .subject(user.getEmail())
                .claim("role", user.getRole().name())
                .claim("userId", user.getId())
                .issuedAt(maintenant)
                .expiration(expiration)
                .signWith(cle);

        if (user.getClient() != null) {
            builder.claim("clientId", user.getClient().getId());
        }

        return builder.compact();
    }

    public Claims extraireClaims(String token) {
        return Jwts.parser()
                .verifyWith(cle)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /** Renvoie null si le token est invalide, expiré, ou mal signé (voir JwtAuthenticationFilter). */
    public Claims validerEtExtraire(String token) {
        try {
            return extraireClaims(token);
        } catch (Exception e) {
            return null;
        }
    }
}
