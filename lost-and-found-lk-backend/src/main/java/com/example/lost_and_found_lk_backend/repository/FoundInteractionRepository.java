package com.example.lost_and_found_lk_backend.repository;

import com.example.lost_and_found_lk_backend.model.FoundInteraction;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface FoundInteractionRepository extends MongoRepository<FoundInteraction, String> {
    List<FoundInteraction> findByFinderEmail(String finderEmail);

    List<FoundInteraction> findByOwnerEmail(String ownerEmail);

    boolean existsByPostIdAndFinderEmail(String postId, String finderEmail);
}
