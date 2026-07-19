package com.weblocal.freelanceos.note;

import com.weblocal.freelanceos.note.dto.NoteConvertDto;
import com.weblocal.freelanceos.note.dto.NoteRequestDto;
import com.weblocal.freelanceos.note.dto.NoteResponseDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Notes libres façon Notion : usage strictement personnel du freelance, jamais
 * exposées au portail client (contrairement aux projets/factures).
 */
@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
@Tag(name = "Notes", description = "Espace de prise de notes libre, convertible en projet")
@PreAuthorize("hasRole('ADMIN')")
public class NoteController {

    private final NoteService noteService;

    @GetMapping
    public List<NoteResponseDto> findAll() {
        return noteService.findAll();
    }

    @GetMapping("/{id}")
    public NoteResponseDto findById(@PathVariable Long id) {
        return noteService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NoteResponseDto create(@Valid @RequestBody NoteRequestDto dto) {
        return noteService.create(dto);
    }

    @PutMapping("/{id}")
    public NoteResponseDto update(@PathVariable Long id, @Valid @RequestBody NoteRequestDto dto) {
        return noteService.update(id, dto);
    }

    @PatchMapping("/{id}/convert")
    public NoteResponseDto convertir(@PathVariable Long id, @Valid @RequestBody NoteConvertDto dto) {
        return noteService.convertir(id, dto.projectId());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        noteService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
