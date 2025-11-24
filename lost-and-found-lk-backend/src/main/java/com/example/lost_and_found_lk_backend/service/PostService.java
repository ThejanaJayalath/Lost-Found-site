package com.example.lost_and_found_lk_backend.service;

import com.example.lost_and_found_lk_backend.model.Post;
import com.example.lost_and_found_lk_backend.model.PostStatus;
import com.example.lost_and_found_lk_backend.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private com.example.lost_and_found_lk_backend.repository.UserRepository userRepository;

    public Post createPost(Post post) {
        if (post.getDate() == null) {
            post.setDate(LocalDate.now());
        }

        // Fetch user details if userId is present
        if (post.getUserId() != null) {
            userRepository.findById(post.getUserId()).ifPresent(user -> {
                post.setUserName(user.getName());
                // Set initial
                if (user.getName() != null && !user.getName().isEmpty()) {
                    post.setUserInitial(user.getName().substring(0, 1).toUpperCase());
                } else {
                    post.setUserInitial("U");
                }
            });
        }

        return postRepository.save(post);
    }

    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    public List<Post> getPostsByStatus(PostStatus status) {
        return postRepository.findByStatus(status);
    }

    public List<Post> getPostsByUserId(String userId) {
        return postRepository.findByUserId(userId);
    }

    public Post getPostById(String id) {
        return postRepository.findById(id).orElse(null);
    }

    public Post updatePost(String id, Post post) {
        if (postRepository.existsById(id)) {
            post.setId(id);
            return postRepository.save(post);
        }
        return null;
    }

    public void deletePost(String id) {
        postRepository.deleteById(id);
    }

    public Post searchLostDevice(String type, String value) {
        List<Post> posts;
        String trimmedValue = value.trim();
        System.out.println("Searching for: type=" + type + ", value='" + trimmedValue + "'");

        if ("PHONE".equalsIgnoreCase(type)) {
            posts = postRepository.findByImeiIgnoreCaseAndStatus(trimmedValue, PostStatus.LOST);
        } else if ("LAPTOP".equalsIgnoreCase(type)) {
            posts = postRepository.findBySerialNumberIgnoreCaseAndStatus(trimmedValue, PostStatus.LOST);
        } else {
            System.out.println("Invalid type: " + type);
            return null;
        }

        System.out.println("Found " + posts.size() + " posts");
        return posts.isEmpty() ? null : posts.get(0);
    }
}
