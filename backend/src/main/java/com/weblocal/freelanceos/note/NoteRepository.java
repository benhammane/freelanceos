package com.weblocal.freelanceos.note;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {

    List<Note> findAllByOrderByDateModificationDesc();

    /** Utilisé par ProjectService pour détacher les notes d'un projet supprimé (voir ProjectService.delete). */
    List<Note> findByProjectId(Long projectId);
}
