package com.example.lost_and_found_lk_backend.repository;

import com.example.lost_and_found_lk_backend.model.Post;
import com.example.lost_and_found_lk_backend.model.PostStatus;
import com.example.lost_and_found_lk_backend.model.ItemType;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface PostRepository extends MongoRepository<Post, String> {
    List<Post> findByStatus(PostStatus status);

    List<Post> findByUserId(String userId);

    List<Post> findByType(ItemType type);

    List<Post> findByImeiIgnoreCaseAndStatus(String imei, PostStatus status);

    List<Post> findBySerialNumberIgnoreCaseAndStatus(String serialNumber, PostStatus status);

    long countByStatus(PostStatus status);

    void deleteByUserId(String userId);
}
