package com.minor.elderlyCare.dto.response;

import com.minor.elderlyCare.model.Role;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

/**
 * Returned by POST /api/auth/register and POST /api/auth/login.
 *
 * The React Native app should store `token` (e.g. in SecureStore)
 * and send it as:  Authorization: Bearer <token>  on every subsequent request.
 */
@Data
@Builder
public class AuthResponse {

    private String token;

    @Builder.Default
    private String tokenType = "Bearer";

    private UUID   userId;
    private String name;
    private String email;
    private Role   role;

    /** How long the token is valid — in milliseconds (default 86 400 000 = 24 h). */
    private long   expiresIn;
}
