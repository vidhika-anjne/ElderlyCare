package com.minor.elderlyCare.dto.response;

import com.minor.elderlyCare.model.Role;
import com.minor.elderlyCare.model.User;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Public-safe representation of a User.
 * passwordHash is intentionally excluded.
 */
@Data
@Builder
public class UserResponse {

    private UUID          id;
    private String        name;
    private String        email;
    private String        phone;
    private Role          role;
    private LocalDate     dateOfBirth;
    private String        profilePictureUrl;
    private boolean       active;
    private OffsetDateTime createdAt;

    /** Convenience factory — maps a User entity to a UserResponse DTO. */
    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .dateOfBirth(user.getDateOfBirth())
                .profilePictureUrl(user.getProfilePictureUrl())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
