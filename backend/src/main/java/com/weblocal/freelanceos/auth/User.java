package com.weblocal.freelanceos.auth;

import com.weblocal.freelanceos.client.Client;
import com.weblocal.freelanceos.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;

/**
 * Compte de connexion. Un User avec role=ADMIN n'a pas de client associé
 * (c'est toi, le freelance). Un User avec role=CLIENT est toujours lié à un
 * Client précis : c'est ce lien qui permet au portail de ne montrer QUE les
 * projets/factures de ce client (voir PortalService).
 *
 * Cette entité implémente directement l'interface UserDetails de Spring
 * Security : c'est l'objet que Spring Security manipule en interne pour
 * représenter "l'utilisateur actuellement authentifié" pendant la
 * vérification du mot de passe au login (voir SecurityConfig et
 * CustomUserDetailsService).
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "users")
public class User extends BaseEntity implements UserDetails {

    @Column(nullable = false, unique = true)
    private String email;

    /** Toujours un hash BCrypt (voir PasswordEncoder dans SecurityConfig), jamais le mot de passe en clair. */
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    private Client client;

    @Override
    public List<GrantedAuthority> getAuthorities() {
        // Spring Security attend le préfixe "ROLE_" pour que hasRole("ADMIN") fonctionne.
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
