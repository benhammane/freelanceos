package com.weblocal.freelanceos.task;

import com.weblocal.freelanceos.common.Priorite;
import com.weblocal.freelanceos.common.ResourceNotFoundException;
import com.weblocal.freelanceos.project.Project;
import com.weblocal.freelanceos.project.ProjectRepository;
import com.weblocal.freelanceos.task.dto.TaskMoveDto;
import com.weblocal.freelanceos.task.dto.TaskRequestDto;
import com.weblocal.freelanceos.task.dto.TaskResponseDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock private TaskRepository taskRepository;
    @Mock private ProjectRepository projectRepository;

    private TaskService taskService;

    @BeforeEach
    void setUp() {
        taskService = new TaskService(taskRepository, projectRepository, new TaskMapper());
    }

    private Project unProjet() {
        Project project = new Project();
        project.setId(10L);
        project.setTitre("Refonte site");
        return project;
    }

    private Task uneTache(Project project) {
        Task task = new Task();
        task.setId(20L);
        task.setTitre("Maquette");
        task.setStatut(StatutTache.A_FAIRE);
        task.setPriorite(Priorite.BASSE);
        task.setProject(project);
        task.setPosition(0);
        return task;
    }

    @Test
    void move_changeUniquementLeStatutEtLaPosition() {
        Task task = uneTache(unProjet());
        when(taskRepository.findById(20L)).thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        TaskResponseDto result = taskService.move(20L, new TaskMoveDto(StatutTache.TERMINE, 2));

        assertThat(result.statut()).isEqualTo(StatutTache.TERMINE);
        assertThat(result.position()).isEqualTo(2);
        assertThat(result.titre()).isEqualTo("Maquette");
    }

    @Test
    void create_rattacheLaTacheAuProjetIndique() {
        Project project = unProjet();
        when(projectRepository.findById(10L)).thenReturn(Optional.of(project));
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        TaskRequestDto dto = new TaskRequestDto("Maquette", null, StatutTache.A_FAIRE, Priorite.BASSE, 10L, 0, null);
        TaskResponseDto result = taskService.create(dto);

        assertThat(result.projectId()).isEqualTo(10L);
    }

    @Test
    void create_lanceResourceNotFoundExceptionSiProjetInconnu() {
        when(projectRepository.findById(999L)).thenReturn(Optional.empty());

        TaskRequestDto dto = new TaskRequestDto("Maquette", null, StatutTache.A_FAIRE, Priorite.BASSE, 999L, 0, null);

        assertThatThrownBy(() -> taskService.create(dto))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
