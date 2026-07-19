package com.weblocal.freelanceos.project;

import com.weblocal.freelanceos.client.Client;
import com.weblocal.freelanceos.client.ClientRepository;
import com.weblocal.freelanceos.common.Priorite;
import com.weblocal.freelanceos.common.ResourceNotFoundException;
import com.weblocal.freelanceos.invoice.InvoiceRepository;
import com.weblocal.freelanceos.note.NoteRepository;
import com.weblocal.freelanceos.project.dto.ProjectMoveDto;
import com.weblocal.freelanceos.project.dto.ProjectRequestDto;
import com.weblocal.freelanceos.project.dto.ProjectResponseDto;
import com.weblocal.freelanceos.project.dto.ScreenshotDto;
import com.weblocal.freelanceos.task.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * @Transactional : Project a une relation LAZY vers Client et une collection
 * LAZY (technos). Comme open-in-view=false (application.yml), leur lecture
 * doit se faire pendant que la session Hibernate est encore active, donc à
 * l'intérieur d'une transaction couvrant tout le corps de la méthode.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ClientRepository clientRepository;
    private final TaskRepository taskRepository;
    private final InvoiceRepository invoiceRepository;
    private final NoteRepository noteRepository;
    private final ProjectScreenshotRepository screenshotRepository;
    private final ProjectMapper projectMapper;

    /**
     * Liste les projets, avec filtrage optionnel par statut et/ou priorité.
     * Les paramètres à null sont simplement ignorés (pas de filtre appliqué).
     * Triés par statut puis position pour correspondre directement à
     * l'ordre d'affichage attendu par le Kanban.
     */
    public List<ProjectResponseDto> findAll(StatutProjet statut, Priorite priorite) {
        List<Project> projects;
        if (statut != null && priorite != null) {
            projects = projectRepository.findByStatutAndPriorite(statut, priorite);
        } else if (statut != null) {
            projects = projectRepository.findByStatut(statut);
        } else if (priorite != null) {
            projects = projectRepository.findByPriorite(priorite);
        } else {
            projects = projectRepository.findAllByOrderByStatutAscPositionAsc();
        }
        return projects.stream().map(this::toDto).toList();
    }

    public ProjectResponseDto findById(Long id) {
        return toDto(getProjectOrThrow(id));
    }

    public ProjectResponseDto create(ProjectRequestDto dto) {
        Client client = getClientOrThrow(dto.clientId());
        Project project = projectMapper.toEntity(dto, client);
        return toDto(projectRepository.save(project));
    }

    public ProjectResponseDto update(Long id, ProjectRequestDto dto) {
        Project project = getProjectOrThrow(id);
        Client client = getClientOrThrow(dto.clientId());
        projectMapper.applyRequestDto(project, dto, client);
        return toDto(projectRepository.save(project));
    }

    /**
     * Déplacement Kanban : ne modifie QUE le statut et la position, sans
     * toucher aux autres champs du projet (titre, client, etc.).
     */
    public ProjectResponseDto move(Long id, ProjectMoveDto dto) {
        Project project = getProjectOrThrow(id);
        project.setStatut(dto.statut());
        project.setPosition(dto.position());
        return toDto(projectRepository.save(project));
    }

    /**
     * Supprime le projet ainsi que ses dépendances directes, pour éviter que
     * la contrainte de clé étrangère de la base ne bloque la suppression :
     *  - les tâches et les captures d'écran n'ont aucun sens sans leur projet :
     *    supprimées en cascade.
     *  - les devis/factures et les notes liées sont des documents qui doivent
     *    être conservés même si leur projet disparaît : on se contente de les
     *    détacher (projet = null) plutôt que de les supprimer.
     */
    public void delete(Long id) {
        Project project = getProjectOrThrow(id);

        taskRepository.deleteByProjectId(id);
        screenshotRepository.deleteByProjectId(id);

        invoiceRepository.findByProjectId(id).forEach(invoice -> invoice.setProject(null));
        noteRepository.findByProjectId(id).forEach(note -> note.setProject(null));

        projectRepository.delete(project);
    }

    // ---------------------------------------------------------------------
    //  Captures d'écran
    // ---------------------------------------------------------------------

    /**
     * Enregistre une capture d'écran pour un projet et renvoie le projet à jour
     * (avec la nouvelle capture dans sa liste). Valide que le fichier est bien
     * une image non vide.
     */
    public ProjectResponseDto ajouterScreenshot(Long projectId, MultipartFile fichier) {
        Project project = getProjectOrThrow(projectId);

        if (fichier == null || fichier.isEmpty()) {
            throw new IllegalArgumentException("Le fichier est vide");
        }
        String contentType = fichier.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Le fichier doit être une image");
        }

        byte[] octets;
        try {
            octets = fichier.getBytes();
        } catch (IOException e) {
            throw new IllegalStateException("Impossible de lire le fichier envoyé", e);
        }

        String nom = fichier.getOriginalFilename() != null ? fichier.getOriginalFilename() : "capture";
        screenshotRepository.save(new ProjectScreenshot(project, nom, contentType, octets));

        return toDto(project);
    }

    /**
     * Charge une capture complète (octets inclus) d'un projet donné, pour la
     * servir au navigateur. 404 si elle n'existe pas ou n'appartient pas au projet.
     */
    @Transactional(readOnly = true)
    public ProjectScreenshot getScreenshot(Long projectId, Long screenshotId) {
        return screenshotRepository.findByIdAndProjectId(screenshotId, projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Capture introuvable avec l'id : " + screenshotId));
    }

    public ProjectResponseDto supprimerScreenshot(Long projectId, Long screenshotId) {
        ProjectScreenshot screenshot = screenshotRepository.findByIdAndProjectId(screenshotId, projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Capture introuvable avec l'id : " + screenshotId));
        screenshotRepository.delete(screenshot);
        return toDto(getProjectOrThrow(projectId));
    }

    // ---------------------------------------------------------------------
    //  Helpers internes
    // ---------------------------------------------------------------------

    /** Assemble le DTO de sortie d'un projet, captures (métadonnées) comprises. */
    private ProjectResponseDto toDto(Project project) {
        List<ScreenshotDto> screenshots = screenshotRepository.findByProjectIdOrderByIdAsc(project.getId()).stream()
                .map(m -> new ScreenshotDto(m.getId(), m.getFilename(), m.getContentType()))
                .toList();
        return projectMapper.toResponseDto(project, screenshots);
    }

    private Project getProjectOrThrow(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projet introuvable avec l'id : " + id));
    }

    private Client getClientOrThrow(Long clientId) {
        return clientRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Client introuvable avec l'id : " + clientId));
    }
}
