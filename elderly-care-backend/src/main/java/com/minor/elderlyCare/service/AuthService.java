package com.minor.elderlyCare.service;

import com.minor.elderlyCare.dto.request.LoginRequest;
import com.minor.elderlyCare.dto.request.RegisterRequest;
import com.minor.elderlyCare.dto.response.AuthResponse;
import com.minor.elderlyCare.exception.DuplicateResourceException;
import com.minor.elderlyCare.model.User;
import com.minor.elderlyCare.repository.UserRepository;
import com.minor.elderlyCare.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository       userRepository;
    private final PasswordEncoder      passwordEncoder;
    private final JwtUtil              jwtUtil;
    private final AuthenticationManager authenticationManager;

    // ── Register ──────────────────────────────────────────────────────────────

    @Transactional
    public AuthResponse register(RegisterRequest req) {

        if (userRepository.existsByEmailIgnoreCase(req.getEmail())) {
            throw new DuplicateResourceException(
                    "Email is already registered: " + req.getEmail());
        }

        if (StringUtils.hasText(req.getPhone())
                && userRepository.existsByPhone(req.getPhone())) {
            throw new DuplicateResourceException(
                    "Phone number is already registered: " + req.getPhone());
        }

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail().toLowerCase())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .phone(req.getPhone())
                .role(req.getRole())
                .dateOfBirth(req.getDateOfBirth())
                .build();

        userRepository.save(user);

        String token = jwtUtil.generateToken(
                user.getEmail(), user.getId(), user.getRole().name());
        return buildAuthResponse(user, token);
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    @Transactional
    public AuthResponse login(LoginRequest req) {

        // Validates credentials — throws BadCredentialsException on failure
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        req.getEmail().toLowerCase(), req.getPassword()));

        User user = userRepository
                .findByEmailIgnoreCase(req.getEmail())
                .orElseThrow();

        // Update the device push token on every login
        if (StringUtils.hasText(req.getPushToken())) {
            user.setPushToken(req.getPushToken());
            userRepository.save(user);
        }

        String token = jwtUtil.generateToken(
                user.getEmail(), user.getId(), user.getRole().name());
        return buildAuthResponse(user, token);
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .expiresIn(jwtUtil.getExpirationMs())
                .build();
    }
}
