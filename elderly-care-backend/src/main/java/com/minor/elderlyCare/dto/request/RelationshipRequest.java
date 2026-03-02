package com.minor.elderlyCare.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Payload for POST /api/relationships/request
 *
 * Either a CHILD or an ELDER can initiate the connection request.
 * The server resolves which side is which based on their roles.
 */
@Data
public class RelationshipRequest {

    /**
     * Email address of the person to connect with.
     *  - If you are a CHILD  → provide the ELDER's email
     *  - If you are an ELDER → provide the CHILD's email
     */
    @NotBlank(message = "Target email is required")
    @Email(message = "Invalid email format")
    private String targetEmail;
}
