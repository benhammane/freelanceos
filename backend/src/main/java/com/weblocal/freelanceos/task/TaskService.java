package com.weblocal.freelanceos.task;

import com.weblocal.freelanceos.common.ResourceNotFoundException;
import com.weblocal.freelanceos.project.Project;
import com.weblocal.freelanceos.project.ProjectRepository;
import com.weblocal.freelanceos.task.dto.TaskMoveDto;
import com.weblocal.freelanceos.task.dto.TaskRequestDto;
import com.weblocal.freelanceos.task.dto.TaskResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** @Transactional : Task a une relation LAZY vers Project (voir ProjectService pour le détail du besoin). */
@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final TaskMapper taskMapper;

    public List<TaskResponseDto> findByProject(Long projectId) {
        return taskRepository.findByProjectIdOrderByStatutAscPositionAsc(projectId).stream()
                .map(taskMapper::toResponseDto)
                .toList();
    }

    public TaskResponseDto findById(Long id) {
        return taskMapper.toResponseDto(getTaskOrThrow(id));
    }

    public TaskResponseDto create(TaskRequestDto dto) {
        Project project = getProjectOrThrow(dto.projectId());
        Task task = taskMapper.toEntity(dto, project);
        return taskMapper.toResponseDto(taskRepository.save(task));
    }

    public TaskResponseDto update(Long id, TaskRequestDto dto) {
        Task task = getTaskOrThrow(id);
        Project project = getProjectOrThrow(dto.projectId());
        taskMapper.applyRequestDto(task, dto, project);
        return taskMapper.toResponseDto(taskRepository.save(task));
    }

    public TaskResponseDto move(Long id, TaskMoveDto dto) {
        Task task = getTaskOrThrow(id);
        task.setStatut(dto.statut());
        task.setPosition(dto.position());
        return taskMapper.toResponseDto(taskRepository.save(task));
    }

    public void delete(Long id) {
        Task task = getTaskOrThrow(id);
        taskRepository.delete(task);
    }

    private Task getTaskOrThrow(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tâche introuvable avec l'id : " + id));
    }

    private Project getProjectOrThrow(Long projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Projet introuvable avec l'id : " + projectId));
    }
}
