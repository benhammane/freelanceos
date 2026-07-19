package com.weblocal.freelanceos.message;

import com.weblocal.freelanceos.auth.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByClientIdOrderByDateCreationAsc(Long clientId);

    Optional<Message> findTopByClientIdOrderByDateCreationDesc(Long clientId);

    /** Nombre de messages non lus envoyés par un rôle donné, dans une conversation. */
    long countByClientIdAndSenderRoleAndLuFalse(Long clientId, Role senderRole);

    /** Marque comme lus tous les messages d'un expéditeur donné dans une conversation. */
    @Modifying
    @Query("update Message m set m.lu = true where m.client.id = :clientId and m.senderRole = :senderRole and m.lu = false")
    void marquerLus(@Param("clientId") Long clientId, @Param("senderRole") Role senderRole);
}
