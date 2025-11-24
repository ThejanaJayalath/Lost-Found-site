package com.example.lost_and_found_lk_backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "found_interactions")
public class FoundInteraction {
    @Id
    private String id;
    private String postId;
    private String finderEmail; // The user who found the item
    private String ownerEmail; // The user who posted the item (optional, for easier querying)

    private String finderName;
    private String finderPhone;
    private String status; // "PENDING", "ACCEPTED", "REJECTED"

    private LocalDateTime timestamp;
}
