package com.weblocal.freelanceos.project;

import com.weblocal.freelanceos.client.Client;
import com.weblocal.freelanceos.project.dto.ProjectRequestDto;
import com.weblocal.freelanceos.project.dto.ProjectResponseDto;
import com.weblocal.freelanceos.project.dto.ScreenshotDto;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class ProjectMapper {

    /**
     * Construit une nouvelle entité Project. Le Client complet est passé en
     * paramètre séparément (déjà chargé par le service depuis clientId) :
     * le mapper ne doit pas accéder lui-même au repository.
     */
    public Project toEntity(ProjectRequestDto dto, Client client) {
        Project project = new Project();
        applyRequestDto(project, dto, client);
        return project;
    }

    public void applyRequestDto(Project project, ProjectRequestDto dto, Client client) {
        project.setTitre(dto.titre());
        project.setDescription(dto.description());
        project.setUrl(dto.url());
        project.setStatut(dto.statut());
        project.setPriorite(dto.priorite());
        project.setClient(client);
        project.setTechnos(dto.technos() != null ? new ArrayList<>(dto.technos()) : new ArrayList<>());
        project.setDateDebut(dto.dateDebut());
        project.setDateFinPrevue(dto.dateFinPrevue());
        project.setMontantEstime(dto.montantEstime());
        project.setPosition(dto.position());
    }

    /**
     * La liste des captures (métadonnées uniquement) est fournie par le service,
     * qui l'a récupérée via une projection légère (voir ScreenshotMeta) : le
     * mapper reste sans accès au repository.
     */
    public ProjectResponseDto toResponseDto(Project project, List<ScreenshotDto> screenshots) {
        return new ProjectResponseDto(
                project.getId(),
                project.getTitre(),
                project.getDescription(),
                project.getUrl(),
                project.getStatut(),
                project.getPriorite(),
                project.getClient().getId(),
                project.getClient().getNom(),
                // new ArrayList<>(...) force la lecture complète de la collection LAZY
                // "technos" MAINTENANT (pendant que la transaction/session est encore
                // ouverte), plutôt que de renvoyer la référence au proxy Hibernate tel
                // quel : Jackson le sérialiserait plus tard, une fois la session fermée,
                // ce qui provoquerait une LazyInitializationException.
                new ArrayList<>(project.getTechnos()),
                project.getDateDebut(),
                project.getDateFinPrevue(),
                project.getMontantEstime(),
                project.getPosition(),
                screenshots
        );
    }
}
