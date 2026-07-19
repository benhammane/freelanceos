package com.weblocal.freelanceos.client;

import com.weblocal.freelanceos.client.dto.ClientAccessResponseDto;
import com.weblocal.freelanceos.client.dto.ClientRequestDto;
import com.weblocal.freelanceos.client.dto.ClientResponseDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur REST du module Client : point d'entrée HTTP.
 * Responsabilité UNIQUE : recevoir la requête HTTP, déléguer au service,
 * renvoyer une réponse HTTP. Aucune logique métier ne doit vivre ici.
 *
 * - @RestController = @Controller + @ResponseBody : indique que chaque
 *   méthode renvoie directement des données (sérialisées en JSON par Spring)
 *   plutôt qu'une vue HTML (comme dans le MVC Spring traditionnel).
 * - @RequestMapping("/api/clients") : préfixe commun à toutes les routes
 *   de ce contrôleur.
 * - @Tag (springdoc) : regroupe ces endpoints sous une section "Clients"
 *   dans l'interface Swagger UI.
 * - @PreAuthorize("hasRole('ADMIN')") au niveau de la classe : s'applique à
 *   TOUTES les méthodes du contrôleur. Seul le freelance (toi) gère les
 *   clients ; les clients eux-mêmes passent par le portail en lecture seule
 *   (voir le package "portal").
 */
@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
@Tag(name = "Clients", description = "Gestion des clients de l'activité freelance")
@PreAuthorize("hasRole('ADMIN')")
public class ClientController {

    private final ClientService clientService;

    @GetMapping
    public List<ClientResponseDto> findAll() {
        return clientService.findAll();
    }

    @GetMapping("/{id}")
    public ClientResponseDto findById(@PathVariable Long id) {
        return clientService.findById(id);
    }

    /**
     * @Valid déclenche la validation Bean Validation du DTO (annotations
     * @NotBlank, @Email... dans ClientRequestDto) AVANT même que le code de
     * cette méthode ne s'exécute. En cas d'échec, Spring lève une
     * MethodArgumentNotValidException, interceptée par notre
     * GlobalExceptionHandler qui renvoie un 400 avec le détail des erreurs.
     *
     * @RequestBody : demande à Spring de désérialiser le corps JSON de la
     * requête HTTP en objet ClientRequestDto (via Jackson, inclus par défaut
     * avec spring-boot-starter-web).
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClientResponseDto create(@Valid @RequestBody ClientRequestDto dto) {
        return clientService.create(dto);
    }

    @PutMapping("/{id}")
    public ClientResponseDto update(@PathVariable Long id, @Valid @RequestBody ClientRequestDto dto) {
        return clientService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        clientService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Crée (ou réinitialise) l'accès du client à son portail en lecture
     * seule. Le mot de passe généré n'est renvoyé qu'une seule fois dans
     * cette réponse : à toi de le communiquer au client par le moyen de ton
     * choix (l'application ne l'enverra jamais elle-même).
     */
    @PostMapping("/{id}/access")
    public ClientAccessResponseDto genererAcces(@PathVariable Long id) {
        return clientService.genererAcces(id);
    }
}
