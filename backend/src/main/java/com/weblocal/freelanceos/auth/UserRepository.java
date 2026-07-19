package com.weblocal.freelanceos.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    /** Un client n'a jamais plus d'un compte d'accès au portail. */
    Optional<User> findByClientId(Long clientId);
}
