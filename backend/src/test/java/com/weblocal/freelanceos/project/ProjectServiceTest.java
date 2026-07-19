package com.weblocal.freelanceos.project;

import com.weblocal.freelanceos.client.Client;
import com.weblocal.freelanceos.client.ClientRepository;
import com.weblocal.freelanceos.common.Priorite;
import com.weblocal.freelanceos.common.ResourceNotFoundException;
import com.weblocal.freelanceos.invoice.Invoice;
import com.weblocal.freelanceos.invoice.InvoiceRepository;
import com.weblocal.freelanceos.note.Note;
import com.weblocal.freelanceos.note.NoteRepository;
import com.weblocal.freelanceos.project.dto.ProjectMoveDto;
import com.weblocal.freelanceos.project.dto.ProjectResponseDto;
import com.weblocal.freelanceos.task.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock private ProjectRepository projectRepository;
    @Mock private ClientRepository clientRepository;
    @Mock private TaskRepository taskRepository;
    @Mock private InvoiceRepository invoiceRepository;
    @Mock private NoteRepository noteRepository;
    @Mock private ProjectScreenshotRepository screenshotRepository;

    private ProjectService projectService;

    @BeforeEach
    void setUp() {
        projectService = new ProjectService(
                projectRepository, clientRepository, taskRepository,
                invoiceRepository, noteRepository, screenshotRepository, new ProjectMapper()
        );
    }

    private Project unProjet() {
        Client client = new Client();
        client.setId(1L);
        client.setNom("Acme Corp");

        Project project = new Project();
        project.setId(10L);
        project.setTitre("Refonte site");
        project.setStatut(StatutProjet.PROSPECT);
        project.setPriorite(Priorite.MOYENNE);
        project.setClient(client);
        project.setPosition(0);
        return project;
    }

    @Test
    void move_changeUniquementLeStatutEtLaPosition() {
        Project project = unProjet();
        when(projectRepository.findById(10L)).thenReturn(Optional.of(project));
        when(projectRepository.save(any(Project.class))).thenAnswer(inv -> inv.getArgument(0));
        when(screenshotRepository.findByProjectIdOrderByIdAsc(10L)).thenReturn(List.of());

        ProjectResponseDto result = projectService.move(10L, new ProjectMoveDto(StatutProjet.EN_COURS, 3));

        assertThat(result.statut()).isEqualTo(StatutProjet.EN_COURS);
        assertThat(result.position()).isEqualTo(3);
        assertThat(result.titre()).isEqualTo("Refonte site");
    }

    @Test
    void delete_supprimeLesTachesEtCapturesEtDetacheFacturesEtNotes() {
        Project project = unProjet();
        Invoice invoice = new Invoice();
        Note note = new Note();
        when(projectRepository.findById(10L)).thenReturn(Optional.of(project));
        when(invoiceRepository.findByProjectId(10L)).thenReturn(List.of(invoice));
        when(noteRepository.findByProjectId(10L)).thenReturn(List.of(note));

        projectService.delete(10L);

        verify(taskRepository).deleteByProjectId(10L);
        verify(screenshotRepository).deleteByProjectId(10L);
        assertThat(invoice.getProject()).isNull();
        assertThat(note.getProject()).isNull();
        verify(projectRepository).delete(project);
    }

    @Test
    void findById_lanceResourceNotFoundExceptionSiInconnu() {
        when(projectRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> projectService.findById(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
