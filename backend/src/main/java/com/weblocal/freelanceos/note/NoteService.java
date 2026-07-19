package com.weblocal.freelanceos.note;

import com.weblocal.freelanceos.common.ResourceNotFoundException;
import com.weblocal.freelanceos.note.dto.NoteRequestDto;
import com.weblocal.freelanceos.note.dto.NoteResponseDto;
import com.weblocal.freelanceos.project.Project;
import com.weblocal.freelanceos.project.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * @Transactional : Note a une relation LAZY vers Project (lue par le mapper
 * pour projectId/projectTitre) ; comme open-in-view=false, cette lecture doit
 * se faire pendant que la transaction est encore active (même raison que
 * pour ProjectService — voir son commentaire pour le détail).
 */
@Service
@RequiredArgsConstructor
@Transactional
public class NoteService {

    private final NoteRepository noteRepository;
    private final ProjectRepository projectRepository;
    private final NoteMapper noteMapper;

    public List<NoteResponseDto> findAll() {
        return noteRepository.findAllByOrderByDateModificationDesc().stream()
                .map(noteMapper::toResponseDto)
                .toList();
    }

    public NoteResponseDto findById(Long id) {
        return noteMapper.toResponseDto(getNoteOrThrow(id));
    }

    public NoteResponseDto create(NoteRequestDto dto) {
        Note note = noteMapper.toEntity(dto);
        return noteMapper.toResponseDto(noteRepository.save(note));
    }

    public NoteResponseDto update(Long id, NoteRequestDto dto) {
        Note note = getNoteOrThrow(id);
        noteMapper.applyRequestDto(note, dto);
        return noteMapper.toResponseDto(noteRepository.save(note));
    }

    public void delete(Long id) {
        Note note = getNoteOrThrow(id);
        noteRepository.delete(note);
    }

    /**
     * Relie la note au projet fraîchement créé à partir d'elle. Le frontend a
     * déjà créé le projet (POST /api/projects) avec les valeurs de la note en
     * pré-remplissage ; cet appel ne fait qu'enregistrer le lien, pour que la
     * note affiche ensuite "→ Projet créé" plutôt que d'être dupliquée ou
     * supprimée.
     */
    public NoteResponseDto convertir(Long id, Long projectId) {
        Note note = getNoteOrThrow(id);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Projet introuvable avec l'id : " + projectId));
        note.setProject(project);
        return noteMapper.toResponseDto(noteRepository.save(note));
    }

    private Note getNoteOrThrow(Long id) {
        return noteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Note introuvable avec l'id : " + id));
    }
}
