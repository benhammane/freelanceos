package com.weblocal.freelanceos.project;

import com.weblocal.freelanceos.common.Priorite;
import com.weblocal.freelanceos.project.dto.ProjectMoveDto;
import com.weblocal.freelanceos.project.dto.ProjectRequestDto;
import com.weblocal.freelanceos.project.dto.ProjectResponseDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@Tag(name = "Projets", description = "Gestion des projets et du Kanban associé")
@PreAuthorize("hasRole('ADMIN')")
public class ProjectController {

    private final ProjectService projectService;

    /**
     * @RequestParam(required = false) : ces paramètres de requête sont
     * optionnels dans l'URL (ex: GET /api/projects?statut=EN_COURS).
     * S'ils sont absents, Spring injecte simplement null.
     */
    @GetMapping
    public List<ProjectResponseDto> findAll(
            @RequestParam(required = false) StatutProjet statut,
            @RequestParam(required = false) Priorite priorite
    ) {
        return projectService.findAll(statut, priorite);
    }

    @GetMapping("/{id}")
    public ProjectResponseDto findById(@PathVariable Long id) {
        return projectService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectResponseDto create(@Valid @RequestBody ProjectRequestDto dto) {
        return projectService.create(dto);
    }

    @PutMapping("/{id}")
    public ProjectResponseDto update(@PathVariable Long id, @Valid @RequestBody ProjectRequestDto dto) {
        return projectService.update(id, dto);
    }

    /**
     * Endpoint dédié au drag-and-drop du Kanban : PATCH ne remplace pas toute
     * la ressource (contrairement à PUT), il applique une modification
     * PARTIELLE — ici uniquement le statut (colonne) et la position.
     */
    @PatchMapping("/{id}/move")
    public ProjectResponseDto move(@PathVariable Long id, @Valid @RequestBody ProjectMoveDto dto) {
        return projectService.move(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        projectService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // -------------------------------------------------------------------
    //  Captures d'écran du projet
    // -------------------------------------------------------------------

    /**
     * Upload d'une capture. consumes = multipart/form-data : la requête n'est
     * pas du JSON mais un formulaire binaire ; Spring lie le champ "file" du
     * formulaire à un MultipartFile. Renvoie le projet à jour (captures incluses).
     */
    @PostMapping(value = "/{id}/screenshots", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProjectResponseDto ajouterScreenshot(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return projectService.ajouterScreenshot(id, file);
    }

    /**
     * Sert les octets bruts d'une capture avec son type MIME d'origine, afin
     * que le frontend puisse l'afficher (récupération via appel authentifié).
     */
    @GetMapping("/{id}/screenshots/{screenshotId}")
    public ResponseEntity<byte[]> voirScreenshot(@PathVariable Long id, @PathVariable Long screenshotId) {
        ProjectScreenshot screenshot = projectService.getScreenshot(id, screenshotId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(screenshot.getContentType()))
                .body(screenshot.getData());
    }

    @DeleteMapping("/{id}/screenshots/{screenshotId}")
    public ProjectResponseDto supprimerScreenshot(@PathVariable Long id, @PathVariable Long screenshotId) {
        return projectService.supprimerScreenshot(id, screenshotId);
    }
}
