package com.minor.elderlyCare.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Payload for POST /api/auth/login
 */
@Data
public class LoginRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    /**
     * FCM (Android) or APNs (iOS) device push token from the React Native app.
     * Sent on every login so the server always has the latest token.
     * Optional — omit if the user denies notification permission.
     */
    private String pushToken;
}
