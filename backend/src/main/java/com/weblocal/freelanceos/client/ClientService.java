package com.weblocal.freelanceos.client;

import com.weblocal.freelanceos.auth.Role;
import com.weblocal.freelanceos.auth.User;
import com.weblocal.freelanceos.auth.UserRepository;
import com.weblocal.freelanceos.client.dto.ClientAccessResponseDto;
import com.weblocal.freelanceos.client.dto.ClientRequestDto;
import com.weblocal.freelanceos.client.dto.ClientResponseDto;
import com.weblocal.freelanceos.common.ConflictException;
import com.weblocal.freelanceos.common.ResourceNotFoundException;
import com.weblocal.freelanceos.invoice.InvoiceRepository;
import com.weblocal.freelanceos.project.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;

/**
 * Couche "service" : contient la logique métier du module Client.
 * C'est l'intermédiaire entre le contrôleur (couche web, HTTP) et le
 * repository (couche accès aux données). Le contrôleur ne doit JAMAIS
 * appeler directement un repository : toute la logique passe par ici.
 *
 * - @Service : spécialisation de @Component pour signaler explicitement
 *   "ceci est un service métier" (facilite la lecture de l'architecture,
 *   et permet à certains outils/aspects de cibler spécifiquement cette
 *   couche, par ex. pour de la gestion transactionnelle).
 *
 * - @RequiredArgsConstructor (Lombok) : génère automatiquement un
 *   constructeur avec un paramètre pour chaque champ "final" de la classe
 *   (ici clientRepository et clientMapper). Spring appelle ce constructeur
 *   au démarrage et lui fournit automatiquement les beans correspondants :
 *   c'est le mécanisme d'INJECTION DE DÉPENDANCES PAR CONSTRUCTEUR, la
 *   méthode recommandée en Spring moderne (plutôt que @Autowired sur un
 *   champ, qui est plus difficile à tester et masque les dépendances).
 */
@Service
@RequiredArgsConstructor
public class ClientService {

    private static final String CARACTERES_MOT_DE_PASSE =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    private static final int LONGUEUR_MOT_DE_PASSE = 12;
    private static final SecureRandom GENERATEUR_ALEATOIRE = new SecureRandom();

    private final ClientRepository clientRepository;
    private final ProjectRepository projectRepository;
    private final InvoiceRepository invoiceRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ClientMapper clientMapper;

    public List<ClientResponseDto> findAll() {
        return clientRepository.findAll().stream()
                .map(clientMapper::toResponseDto)
                .toList();
    }

    public ClientResponseDto findById(Long id) {
        Client client = getClientOrThrow(id);
        return clientMapper.toResponseDto(client);
    }

    public ClientResponseDto create(ClientRequestDto dto) {
        Client client = clientMapper.toEntity(dto);
        Client saved = clientRepository.save(client);
        return clientMapper.toResponseDto(saved);
    }

    public ClientResponseDto update(Long id, ClientRequestDto dto) {
        Client client = getClientOrThrow(id);
        clientMapper.applyRequestDto(client, dto);
        Client saved = clientRepository.save(client);
        return clientMapper.toResponseDto(saved);
    }

    /**
     * Contrairement à un projet, un client ne peut pas être "détaché" de ses
     * projets/factures (client_id est obligatoire sur ces tables) : on
     * refuse donc explicitement la suppression avec un message clair plutôt
     * que de laisser la contrainte de clé étrangère de la base remonter une
     * erreur 500 générique et incompréhensible pour l'utilisateur.
     */
    @Transactional
    public void delete(Long id) {
        Client client = getClientOrThrow(id);

        if (projectRepository.existsByClientId(id)) {
            throw new ConflictException("Impossible de supprimer ce client : il est encore lié à au moins un projet");
        }
        if (invoiceRepository.existsByClientId(id)) {
            throw new ConflictException("Impossible de supprimer ce client : il est encore lié à au moins un devis/facture");
        }

        // Contrairement aux projets/factures, un éventuel compte d'accès au
        // portail (User de rôle CLIENT) n'a aucune raison de survivre à la
        // suppression du client : on le supprime en cascade plutôt que de
        // bloquer la suppression pour ça.
        userRepository.findByClientId(id).ifPresent(userRepository::delete);

        clientRepository.delete(client);
    }

    /**
     * Crée (ou réinitialise, si un accès existe déjà) le compte d'accès au
     * portail client. Génère un mot de passe aléatoire, ne le stocke QUE sous
     * forme de hash BCrypt, et le renvoie en clair une seule fois dans la
     * réponse : c'est à toi de le communiquer au client, l'application ne le
     * garde jamais en mémoire au-delà de cet appel.
     */
    @Transactional
    public ClientAccessResponseDto genererAcces(Long id) {
        Client client = getClientOrThrow(id);
        String motDePasse = genererMotDePasseAleatoire();

        User user = userRepository.findByClientId(id).orElseGet(User::new);
        user.setEmail(client.getEmail());
        user.setRole(Role.CLIENT);
        user.setClient(client);
        user.setPassword(passwordEncoder.encode(motDePasse));
        userRepository.save(user);

        return new ClientAccessResponseDto(client.getEmail(), motDePasse);
    }

    private String genererMotDePasseAleatoire() {
        StringBuilder mdp = new StringBuilder(LONGUEUR_MOT_DE_PASSE);
        for (int i = 0; i < LONGUEUR_MOT_DE_PASSE; i++) {
            mdp.append(CARACTERES_MOT_DE_PASSE.charAt(GENERATEUR_ALEATOIRE.nextInt(CARACTERES_MOT_DE_PASSE.length())));
        }
        return mdp.toString();
    }

    /**
     * Factorise la recherche par id + levée de ResourceNotFoundException
     * si absent, pour éviter de dupliquer cette logique dans chaque méthode.
     */
    private Client getClientOrThrow(Long id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client introuvable avec l'id : " + id));
    }
}
