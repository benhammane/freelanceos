package com.weblocal.freelanceos.client;

import com.weblocal.freelanceos.client.dto.ClientRequestDto;
import com.weblocal.freelanceos.client.dto.ClientResponseDto;
import org.springframework.stereotype.Component;

/**
 * Mapper manuel entité <-> DTO pour Client.
 *
 * On aurait pu utiliser une librairie comme MapStruct pour générer ce code
 * automatiquement, mais pour un premier module et le temps d'apprendre les
 * bases, un mapper écrit à la main reste plus simple à comprendre et à
 * déboguer. On pourra introduire MapStruct plus tard si la duplication
 * devient pénible sur les modules suivants.
 *
 * @Component : annotation générique Spring indiquant "gère cet objet comme un
 * bean". @Service et @Repository sont en réalité des spécialisations de
 * @Component (même mécanisme, juste plus explicites sur le rôle de la classe).
 */
@Component
public class ClientMapper {

    /**
     * Convertit un DTO d'entrée en nouvelle entité (utilisé à la création).
     * Ne définit pas l'id : c'est la base de données qui le génère.
     */
    public Client toEntity(ClientRequestDto dto) {
        Client client = new Client();
        applyRequestDto(client, dto);
        return client;
    }

    /**
     * Applique les champs d'un DTO d'entrée sur une entité EXISTANTE
     * (utilisé à la modification, pour ne pas écraser l'id ni les dates d'audit).
     */
    public void applyRequestDto(Client client, ClientRequestDto dto) {
        client.setNom(dto.nom());
        client.setEmail(dto.email());
        client.setEntreprise(dto.entreprise());
        client.setTelephone(dto.telephone());
        client.setAdresse(dto.adresse());
        client.setNotes(dto.notes());
    }

    /**
     * Convertit une entité en DTO de sortie, pour ne jamais exposer
     * directement l'entité JPA dans les réponses de l'API.
     */
    public ClientResponseDto toResponseDto(Client client) {
        return new ClientResponseDto(
                client.getId(),
                client.getNom(),
                client.getEmail(),
                client.getEntreprise(),
                client.getTelephone(),
                client.getAdresse(),
                client.getNotes(),
                client.getDateCreation()
        );
    }
}
