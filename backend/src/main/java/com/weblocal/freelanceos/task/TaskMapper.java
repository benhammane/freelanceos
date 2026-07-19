package com.weblocal.freelanceos.task;

import com.weblocal.freelanceos.project.Project;
import com.weblocal.freelanceos.task.dto.TaskRequestDto;
import com.weblocal.freelanceos.task.dto.TaskResponseDto;
import org.springframework.stereotype.Component;

@Component
public class TaskMapper {

    public Task toEntity(TaskRequestDto dto, Project project) {
        Task task = new Task();
        applyRequestDto(task, dto, project);
        return task;
    }

    public void applyRequestDto(Task task, TaskRequestDto dto, Project project) {
        task.setTitre(dto.titre());
        task.setDescription(dto.description());
        task.setStatut(dto.statut());
        task.setPriorite(dto.priorite());
        task.setProject(project);
        task.setPosition(dto.position());
        task.setDateEcheance(dto.dateEcheance());
    }

    public TaskResponseDto toResponseDto(Task task) {
        return new TaskResponseDto(
                task.getId(),
                task.getTitre(),
                task.getDescription(),
                task.getStatut(),
                task.getPriorite(),
                task.getProject().getId(),
                task.getPosition(),
                task.getDateEcheance()
        );
    }
}
