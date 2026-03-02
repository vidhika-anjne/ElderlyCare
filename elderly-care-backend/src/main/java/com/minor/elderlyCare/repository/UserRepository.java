package com.minor.elderlyCare.repository;

import com.minor.elderlyCare.model.Role;
import com.minor.elderlyCare.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA repository for the {@link User} entity.
 *
 * Spring Data automatically generates the SQL for all declared
 * method signatures — no implementation class required.
 */
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    // ── Authentication / Lookup ──────────────────────────────────────────────

    /** Used during login: load user by email (case-insensitive). */
    Optional<User> findByEmailIgnoreCase(String email);

    /** Check whether an email address is already registered. */
    boolean existsByEmailIgnoreCase(String email);

    /** Check whether a phone number is already registered. */
    boolean existsByPhone(String phone);

    // ── Admin / Management Queries ───────────────────────────────────────────

    /** List all active users with a specific role (ELDER or CHILD). */
    List<User> findByRoleAndIsActiveTrue(Role role);

    /** Find a user only if their account is active. */
    Optional<User> findByIdAndIsActiveTrue(UUID id);
}
