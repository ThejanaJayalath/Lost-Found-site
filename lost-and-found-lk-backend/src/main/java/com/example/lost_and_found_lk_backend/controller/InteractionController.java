package com.example.lost_and_found_lk_backend.controller;

import com.example.lost_and_found_lk_backend.model.FoundInteraction;
import com.example.lost_and_found_lk_backend.model.Post;
import com.example.lost_and_found_lk_backend.repository.FoundInteractionRepository;
import com.example.lost_and_found_lk_backend.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/interactions")
@CrossOrigin(origins = "http://localhost:5173")
public class InteractionController {

    @Autowired
    private FoundInteractionRepository interactionRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private com.example.lost_and_found_lk_backend.repository.UserRepository userRepository;

    @PostMapping("/found")
    public ResponseEntity<?> recordFoundInteraction(@RequestBody FoundInteraction interaction) {
        if (interaction.getPostId() == null || interaction.getFinderEmail() == null) {
            return ResponseEntity.badRequest().body("Post ID and Finder Email are required");
        }

        // Check if already recorded
        if (interactionRepository.existsByPostIdAndFinderEmail(interaction.getPostId(), interaction.getFinderEmail())) {
            return ResponseEntity.badRequest().body("Interaction already recorded");
        }

        // Fetch finder details
        com.example.lost_and_found_lk_backend.model.User finder = userRepository
                .findByEmail(interaction.getFinderEmail()).orElse(null);
        if (finder != null) {
            interaction.setFinderName(finder.getName());
            interaction.setFinderPhone(finder.getPhoneNumber());
        }

        // Fetch Post and Owner details to set ownerEmail
        Optional<Post> postOpt = postRepository.findById(interaction.getPostId());
        if (postOpt.isPresent()) {
            Post post = postOpt.get();
            if (post.getUserId() != null) {
                userRepository.findById(post.getUserId()).ifPresent(owner -> {
                    interaction.setOwnerEmail(owner.getEmail());
                });
            }
        }

        interaction.setStatus("PENDING");
        interaction.setTimestamp(LocalDateTime.now());
        FoundInteraction saved = interactionRepository.save(interaction);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/user/{email}/found")
    public ResponseEntity<List<Post>> getFoundPostsByUser(@PathVariable String email) {
        List<FoundInteraction> interactions = interactionRepository.findByFinderEmail(email);
        List<Post> foundPosts = new ArrayList<>();

        for (FoundInteraction interaction : interactions) {
            Optional<Post> post = postRepository.findById(interaction.getPostId());
            post.ifPresent(foundPosts::add);
        }

        return ResponseEntity.ok(foundPosts);
    }

    @GetMapping("/user/{email}/claims")
    public ResponseEntity<List<FoundInteraction>> getClaimsForUser(@PathVariable String email) {
        List<FoundInteraction> claims = interactionRepository.findByOwnerEmail(email);
        return ResponseEntity.ok(claims);
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<?> confirmClaim(@PathVariable String id) {
        Optional<FoundInteraction> interactionOpt = interactionRepository.findById(id);
        if (interactionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        FoundInteraction interaction = interactionOpt.get();
        interaction.setStatus("ACCEPTED");
        interactionRepository.save(interaction);

        Optional<Post> postOpt = postRepository.findById(interaction.getPostId());
        if (postOpt.isPresent()) {
            Post post = postOpt.get();
            post.setStatus(com.example.lost_and_found_lk_backend.model.PostStatus.RESOLVED);
            postRepository.save(post);
        }

        return ResponseEntity.ok(interaction);
    }
}
