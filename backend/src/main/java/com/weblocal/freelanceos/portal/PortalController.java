package com.weblocal.freelanceos.portal;

import com.weblocal.freelanceos.auth.AuthenticatedUser;
import com.weblocal.freelanceos.invoice.dto.AccepterDevisDto;
import com.weblocal.freelanceos.invoice.dto.InvoiceResponseDto;
import com.weblocal.freelanceos.message.MessageService;
import com.weblocal.freelanceos.message.dto.MessageDto;
import com.weblocal.freelanceos.message.dto.SendMessageDto;
import com.weblocal.freelanceos.project.ProjectScreenshot;
import com.weblocal.freelanceos.project.dto.ProjectResponseDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Portail client : lecture seule, réservé au rôle CLIENT.
 *
 * @AuthenticationPrincipal AuthenticatedUser : Spring Security injecte
 * directement l'objet posé dans le SecurityContext par JwtAuthenticationFilter
 * (voir cette classe) — pas besoin de repasser par un repository ici, le
 * clientId a déjà été extrait du token JWT.
 */
@RestController
@RequestMapping("/api/portal")
@RequiredArgsConstructor
@Tag(name = "Portail client", description = "Accès en lecture seule pour un client : ses projets et ses devis/factures")
@PreAuthorize("hasRole('CLIENT')")
public class PortalController {

    private final PortalService portalService;
    private final MessageService messageService;

    // --- Messagerie avec le freelance ---

    @GetMapping("/messages")
    public List<MessageDto> mesMessages(@AuthenticationPrincipal AuthenticatedUser user) {
        return messageService.getConversation(user.clientId());
    }

    @PostMapping("/messages")
    public MessageDto envoyerMessage(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody SendMessageDto dto
    ) {
        return messageService.sendAsClient(user.clientId(), dto.contenu(), user.userId());
    }

    @PostMapping("/messages/read")
    public ResponseEntity<Void> marquerMessagesLus(@AuthenticationPrincipal AuthenticatedUser user) {
        messageService.markReadByClient(user.clientId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/projects")
    public List<ProjectResponseDto> mesProjects(@AuthenticationPrincipal AuthenticatedUser user) {
        return portalService.findMesProjects(user.clientId());
    }

    @GetMapping("/invoices")
    public List<InvoiceResponseDto> mesInvoices(@AuthenticationPrincipal AuthenticatedUser user) {
        return portalService.findMesInvoices(user.clientId());
    }

    /** Détail d'une facture du client authentifié (utilisé par la page de paiement). */
    @GetMapping("/invoices/{id}")
    public InvoiceResponseDto monInvoice(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long id
    ) {
        return portalService.findMonInvoice(user.clientId(), id);
    }

    /** Acceptation en ligne d'un devis par le client (signature électronique simple). */
    @PostMapping("/invoices/{id}/accepter")
    public InvoiceResponseDto accepterDevis(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long id,
            @Valid @RequestBody AccepterDevisDto dto,
            HttpServletRequest request
    ) {
        return portalService.accepterDevis(user.clientId(), id, dto.signataireNom(), extraireIp(request));
    }

    /** Extrait l'IP réelle du client, en tenant compte du proxy (Railway) via X-Forwarded-For. */
    private static String extraireIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    /** Sert une capture d'écran d'un projet du client authentifié. */
    @GetMapping("/projects/{projectId}/screenshots/{screenshotId}")
    public ResponseEntity<byte[]> voirScreenshot(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long projectId,
            @PathVariable Long screenshotId
    ) {
        ProjectScreenshot screenshot = portalService.getScreenshotDuClient(user.clientId(), projectId, screenshotId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(screenshot.getContentType()))
                .body(screenshot.getData());
    }

    @GetMapping("/invoices/{id}/pdf")
    public ResponseEntity<byte[]> telechargerPdf(@AuthenticationPrincipal AuthenticatedUser user, @PathVariable Long id) {
        InvoiceResponseDto invoice = portalService.findMonInvoice(user.clientId(), id);
        byte[] pdf = portalService.genererPdf(user.clientId(), id);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + invoice.numero() + ".pdf\"")
                .body(pdf);
    }
}
