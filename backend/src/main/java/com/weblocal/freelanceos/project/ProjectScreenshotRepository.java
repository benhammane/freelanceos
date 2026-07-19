package com.weblocal.freelanceos.project;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectScreenshotRepository extends JpaRepository<ProjectScreenshot, Long> {

    /** Métadonnées des captures d'un projet (SANS les octets, voir ScreenshotMeta). */
    List<ScreenshotMeta> findByProjectIdOrderByIdAsc(Long projectId);

    /**
     * Charge une capture COMPLÈTE (avec ses octets) uniquement si elle
     * appartient bien au projet indiqué : garantit qu'on ne sert pas l'image
     * d'un autre projet via un id mal formé.
     */
    Optional<ProjectScreenshot> findByIdAndProjectId(Long id, Long projectId);

    /** Supprime toutes les captures d'un projet (utilisé à la suppression du projet). */
    void deleteByProjectId(Long projectId);
}
