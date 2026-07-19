package com.weblocal.freelanceos.portal;

import com.weblocal.freelanceos.auth.AuthenticatedUser;
import com.weblocal.freelanceos.invoice.dto.InvoiceResponseDto;
import com.weblocal.freelanceos.project.ProjectScreenshot;
import com.weblocal.freelanceos.project.dto.ProjectResponseDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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

    @GetMapping("/projects")
    public List<ProjectResponseDto> mesProjects(@AuthenticationPrincipal AuthenticatedUser user) {
        return portalService.findMesProjects(user.clientId());
    }

    @GetMapping("/invoices")
    public List<InvoiceResponseDto> mesInvoices(@AuthenticationPrincipal AuthenticatedUser user) {
        return portalService.findMesInvoices(user.clientId());
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
