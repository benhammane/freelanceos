package com.weblocal.freelanceos.message;

import com.weblocal.freelanceos.auth.Role;
import com.weblocal.freelanceos.auth.UserRepository;
import com.weblocal.freelanceos.client.Client;
import com.weblocal.freelanceos.client.ClientRepository;
import com.weblocal.freelanceos.common.ResourceNotFoundException;
import com.weblocal.freelanceos.message.dto.ChatEvent;
import com.weblocal.freelanceos.message.dto.ConversationDto;
import com.weblocal.freelanceos.message.dto.MessageDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

/**
 * Logique de la messagerie client / freelance.
 *
 * Chaque envoi persiste le message PUIS le pousse en temps réel via
 * ChatWebSocketHandler au destinataire :
 *  - message ADMIN -> poussé au compte portail du client concerné ;
 *  - message CLIENT -> poussé à tous les comptes ADMIN.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class MessageService {

    private final MessageRepository messageRepository;
    private final ClientRepository clientRepository;
    private final UserRepository userRepository;
    private final ChatWebSocketHandler chatHandler;

    public MessageDto sendAsAdmin(Long clientId, String contenu, Long adminUserId) {
        Client client = getClient(clientId);
        MessageDto dto = toDto(persist(client, Role.ADMIN, adminUserId, contenu));
        userRepository.findByClientId(clientId)
                .ifPresent(u -> chatHandler.sendToUser(u.getId(), new ChatEvent("message", dto)));
        return dto;
    }

    public MessageDto sendAsClient(Long clientId, String contenu, Long clientUserId) {
        Client client = getClient(clientId);
        MessageDto dto = toDto(persist(client, Role.CLIENT, clientUserId, contenu));
        userRepository.findByRole(Role.ADMIN)
                .forEach(a -> chatHandler.sendToUser(a.getId(), new ChatEvent("message", dto)));
        return dto;
    }

    @Transactional(readOnly = true)
    public List<MessageDto> getConversation(Long clientId) {
        return messageRepository.findByClientIdOrderByDateCreationAsc(clientId).stream()
                .map(this::toDto)
                .toList();
    }

    public void markReadByAdmin(Long clientId) {
        messageRepository.marquerLus(clientId, Role.CLIENT);
    }

    public void markReadByClient(Long clientId) {
        messageRepository.marquerLus(clientId, Role.ADMIN);
    }

    /** Liste des conversations pour l'admin : tous les clients, plus récents d'abord. */
    @Transactional(readOnly = true)
    public List<ConversationDto> conversationsForAdmin() {
        return clientRepository.findAll().stream()
                .map(client -> {
                    var last = messageRepository.findTopByClientIdOrderByDateCreationDesc(client.getId());
                    long nonLus = messageRepository.countByClientIdAndSenderRoleAndLuFalse(client.getId(), Role.CLIENT);
                    return new ConversationDto(
                            client.getId(),
                            client.getNom(),
                            last.map(Message::getContenu).orElse(null),
                            last.map(Message::getDateCreation).orElse(null),
                            nonLus);
                })
                .sorted(Comparator.comparing(ConversationDto::dernierAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    private Client getClient(Long clientId) {
        return clientRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Client introuvable avec l'id : " + clientId));
    }

    private Message persist(Client client, Role role, Long senderUserId, String contenu) {
        Message m = new Message();
        m.setClient(client);
        m.setSenderRole(role);
        m.setSenderUserId(senderUserId);
        m.setContenu(contenu);
        m.setLu(false);
        return messageRepository.save(m);
    }

    private MessageDto toDto(Message m) {
        return new MessageDto(
                m.getId(),
                m.getClient().getId(),
                m.getSenderRole(),
                m.getContenu(),
                m.getDateCreation(),
                m.isLu());
    }
}
