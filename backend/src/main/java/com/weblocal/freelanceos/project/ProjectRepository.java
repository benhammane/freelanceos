package com.weblocal.freelanceos.project;

import com.weblocal.freelanceos.common.Priorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Les méthodes findByStatut/findByPriorite ne sont PAS implémentées à la main :
 * Spring Data JPA génère la requête SQL correspondante automatiquement à
 * partir du NOM de la méthode ("derived query methods"). Par exemple
 * findByStatutAndPriorite se traduit en
 * "SELECT * FROM projects WHERE statut = ? AND priorite = ?".
 */
@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByStatut(StatutProjet statut);

    List<Project> findByPriorite(Priorite priorite);

    List<Project> findByStatutAndPriorite(StatutProjet statut, Priorite priorite);

    List<Project> findAllByOrderByStatutAscPositionAsc();

    long countByStatut(StatutProjet statut);

    /** Utilisé par ClientService pour empêcher la suppression d'un client encore lié à des projets. */
    boolean existsByClientId(Long clientId);

    /** Utilisé par le portail client (PortalService) pour ne lister que les projets du client authentifié. */
    List<Project> findByClientIdOrderByStatutAscPositionAsc(Long clientId);
}
