package com.weblocal.freelanceos.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    /** Un client n'a jamais plus d'un compte d'accès au portail. */
    Optional<User> findByClientId(Long clientId);

    /** Tous les comptes d'un rôle donné (ex: pour notifier tous les ADMIN). */
    List<User> findByRole(Role role);
}
