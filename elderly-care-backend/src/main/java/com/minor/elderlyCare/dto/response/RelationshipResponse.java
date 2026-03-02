package com.minor.elderlyCare.dto.response;

import com.minor.elderlyCare.model.ElderChildRelationship;
import com.minor.elderlyCare.model.RelationshipStatus;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Represents an elder ↔ child monitoring relationship returned by the API.
 */
@Data
@Builder
public class RelationshipResponse {

    private UUID               id;
    private UserResponse       elder;
    private UserResponse       child;
    private RelationshipStatus status;
    private UUID               requestedById;
    private OffsetDateTime     createdAt;
    private OffsetDateTime     updatedAt;

    /** Convenience factory — maps an ElderChildRelationship entity to a DTO. */
    public static RelationshipResponse from(ElderChildRelationship r) {
        return RelationshipResponse.builder()
                .id(r.getId())
                .elder(UserResponse.from(r.getElder()))
                .child(UserResponse.from(r.getChild()))
                .status(r.getStatus())
                .requestedById(r.getRequestedBy().getId())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
