package com.weblocal.freelanceos.auth;

import com.weblocal.freelanceos.auth.dto.LoginRequestDto;
import com.weblocal.freelanceos.auth.dto.LoginResponseDto;
import com.weblocal.freelanceos.common.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentification", description = "Connexion (admin et clients)")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    /**
     * authenticationManager.authenticate(...) délègue à CustomUserDetailsService
     * (recherche par email) puis au PasswordEncoder (comparaison du hash BCrypt) :
     * si les identifiants sont incorrects, il lève une exception automatiquement
     * (interceptée plus bas), sans qu'on ait à comparer le mot de passe nous-mêmes.
     */
    @Transactional
    @PostMapping("/login")
    public LoginResponseDto login(@Valid @RequestBody LoginRequestDto dto) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.email(), dto.password())
            );
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Email ou mot de passe incorrect");
        }

        User user = userRepository.findByEmail(dto.email())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        String token = jwtService.genererToken(user);
        boolean estClient = user.getRole() == Role.CLIENT && user.getClient() != null;

        return new LoginResponseDto(
                token,
                user.getRole(),
                user.getEmail(),
                estClient ? user.getClient().getId() : null,
                estClient ? user.getClient().getNom() : null
        );
    }
}
