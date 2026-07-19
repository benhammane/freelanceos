package com.weblocal.freelanceos.message;

import com.weblocal.freelanceos.auth.AuthenticatedUser;
import com.weblocal.freelanceos.message.dto.ConversationDto;
import com.weblocal.freelanceos.message.dto.MessageDto;
import com.weblocal.freelanceos.message.dto.SendMessageDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Messagerie côté freelance (ADMIN) : liste des conversations (une par client)
 * et fil de discussion avec un client donné.
 */
@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@Tag(name = "Messagerie", description = "Messagerie freelance / clients")
@PreAuthorize("hasRole('ADMIN')")
public class MessageController {

    private final MessageService messageService;

    @GetMapping("/conversations")
    public List<ConversationDto> conversations() {
        return messageService.conversationsForAdmin();
    }

    @GetMapping("/{clientId}")
    public List<MessageDto> conversation(@PathVariable Long clientId) {
        return messageService.getConversation(clientId);
    }

    @PostMapping("/{clientId}")
    public MessageDto send(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long clientId,
            @Valid @RequestBody SendMessageDto dto
    ) {
        return messageService.sendAsAdmin(clientId, dto.contenu(), user.userId());
    }

    @PostMapping("/{clientId}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long clientId) {
        messageService.markReadByAdmin(clientId);
        return ResponseEntity.ok().build();
    }
}
