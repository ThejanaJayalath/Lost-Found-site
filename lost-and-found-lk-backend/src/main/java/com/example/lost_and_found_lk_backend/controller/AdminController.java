package com.example.lost_and_found_lk_backend.controller;

import com.example.lost_and_found_lk_backend.model.Post;
import com.example.lost_and_found_lk_backend.model.PostStatus;
import com.example.lost_and_found_lk_backend.model.User;
import com.example.lost_and_found_lk_backend.repository.FoundInteractionRepository;
import com.example.lost_and_found_lk_backend.repository.PostRepository;
import com.example.lost_and_found_lk_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private FoundInteractionRepository foundInteractionRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        if ("admin@gmail.com".equals(email) && "admin123".equals(password)) {
            return ResponseEntity.ok(Map.of("token", "admin-token", "role", "admin"));
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        long lostCount = postRepository.countByStatus(PostStatus.LOST);
        long foundCount = postRepository.countByStatus(PostStatus.FOUND);
        long resolvedCount = postRepository.countByStatus(PostStatus.RESOLVED);
        long userCount = userRepository.count();

        return ResponseEntity.ok(Map.of(
                "lost", lostCount,
                "found", foundCount,
                "resolved", resolvedCount,
                "users", userCount));
    }

    @GetMapping("/users")
    public ResponseEntity<?> getUsers() {
        List<User> users = userRepository.findAll();
        List<Post> allPosts = postRepository.findAll();

        // Map user ID to their posts
        Map<String, List<Post>> userPostsMap = new HashMap<>();
        for (Post post : allPosts) {
            userPostsMap.computeIfAbsent(post.getUserId(), k -> new ArrayList<>()).add(post);
        }

        // Create a list of user details with their latest activity
        List<Map<String, Object>> userDetails = users.stream().map(user -> {
            List<Post> posts = userPostsMap.getOrDefault(user.getId(), new ArrayList<>());
            // Sort posts by date/time descending
            posts.sort((p1, p2) -> {
                if (p1.getDate() == null || p2.getDate() == null)
                    return 0;
                int dateComp = p2.getDate().compareTo(p1.getDate());
                if (dateComp != 0)
                    return dateComp;
                if (p1.getTime() == null || p2.getTime() == null)
                    return 0;
                return p2.getTime().compareTo(p1.getTime());
            });

            Map<String, Object> detail = new HashMap<>();
            detail.put("user", user);
            detail.put("posts", posts);
            detail.put("postCount", posts.size());

            // Determine latest activity for sorting
            if (!posts.isEmpty()) {
                detail.put("latestActivity", posts.get(0).getDate());
            } else {
                detail.put("latestActivity", null);
            }

            return detail;
        }).sorted((u1, u2) -> {
            // Sort users by latest activity descending
            Object d1 = u1.get("latestActivity");
            Object d2 = u2.get("latestActivity");
            if (d1 == null && d2 == null)
                return 0;
            if (d1 == null)
                return 1;
            if (d2 == null)
                return -1;
            return ((Comparable) d2).compareTo(d1);
        }).collect(Collectors.toList());

        return ResponseEntity.ok(userDetails);
    }

    @PutMapping("/users/{id}/block")
    public ResponseEntity<?> toggleBlockUser(@PathVariable String id) {
        return userRepository.findById(id).map(user -> {
            user.setBlocked(!user.isBlocked());
            userRepository.save(user);
            return ResponseEntity.ok(user);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/posts/{id}/hide")
    public ResponseEntity<?> toggleHidePost(@PathVariable String id) {
        return postRepository.findById(id).map(post -> {
            post.setHidden(!post.isHidden());
            postRepository.save(post);
            return ResponseEntity.ok(post);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            // Also delete user's posts? For now, keep them or maybe hide them.
            // Let's delete them to be clean.
            postRepository.deleteByUserId(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> deletePost(@PathVariable String id) {
        if (postRepository.existsById(id)) {
            postRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
