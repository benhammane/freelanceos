package com.weblocal.freelanceos.task;

import com.weblocal.freelanceos.task.dto.TaskMoveDto;
import com.weblocal.freelanceos.task.dto.TaskRequestDto;
import com.weblocal.freelanceos.task.dto.TaskResponseDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Tag(name = "Tâches", description = "Sous-tâches d'un projet (Kanban de détail)")
@PreAuthorize("hasRole('ADMIN')")
public class TaskController {

    private final TaskService taskService;

    /**
     * projectId est obligatoire ici (pas de liste globale de toutes les
     * tâches tous projets confondus) : les tâches n'ont de sens que dans le
     * contexte d'un projet, comme demandé pour la page de détail projet.
     */
    @GetMapping
    public List<TaskResponseDto> findByProject(@RequestParam Long projectId) {
        return taskService.findByProject(projectId);
    }

    @GetMapping("/{id}")
    public TaskResponseDto findById(@PathVariable Long id) {
        return taskService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponseDto create(@Valid @RequestBody TaskRequestDto dto) {
        return taskService.create(dto);
    }

    @PutMapping("/{id}")
    public TaskResponseDto update(@PathVariable Long id, @Valid @RequestBody TaskRequestDto dto) {
        return taskService.update(id, dto);
    }

    @PatchMapping("/{id}/move")
    public TaskResponseDto move(@PathVariable Long id, @Valid @RequestBody TaskMoveDto dto) {
        return taskService.move(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        taskService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
