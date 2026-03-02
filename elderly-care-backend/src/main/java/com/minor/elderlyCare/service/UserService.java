package com.minor.elderlyCare.service;

import com.minor.elderlyCare.dto.response.UserResponse;
import com.minor.elderlyCare.exception.ResourceNotFoundException;
import com.minor.elderlyCare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    public UserResponse getUserById(UUID id) {
        return userRepository.findByIdAndIsActiveTrue(id)
                .map(UserResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found: " + id));
    }
}
