package com.minor.elderlyCare.controller;

import com.minor.elderlyCare.dto.response.UserResponse;
import com.minor.elderlyCare.security.CustomUserPrincipal;
import com.minor.elderlyCare.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * GET /api/users/me
     * Returns the profile of the currently authenticated user.
     * No DB query needed — the full User entity is already in the principal.
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(UserResponse.from(principal.getUser()));
    }

    /**
     * GET /api/users/{id}
     * Fetch any active user's public profile by UUID.
     * Useful for displaying an elder's info on the child's screen.
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }
}
