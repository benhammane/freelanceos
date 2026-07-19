package com.weblocal.freelanceos.note;

import com.weblocal.freelanceos.note.dto.NoteRequestDto;
import com.weblocal.freelanceos.note.dto.NoteResponseDto;
import org.springframework.stereotype.Component;

@Component
public class NoteMapper {

    public Note toEntity(NoteRequestDto dto) {
        Note note = new Note();
        applyRequestDto(note, dto);
        return note;
    }

    public void applyRequestDto(Note note, NoteRequestDto dto) {
        note.setTitre(dto.titre());
        note.setContenu(dto.contenu());
    }

    public NoteResponseDto toResponseDto(Note note) {
        boolean convertie = note.getProject() != null;
        return new NoteResponseDto(
                note.getId(),
                note.getTitre(),
                note.getContenu(),
                note.getDateCreation(),
                note.getDateModification(),
                convertie ? note.getProject().getId() : null,
                convertie ? note.getProject().getTitre() : null
        );
    }
}
