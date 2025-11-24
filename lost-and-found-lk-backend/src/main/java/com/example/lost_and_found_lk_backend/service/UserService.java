package com.example.lost_and_found_lk_backend.service;

import com.example.lost_and_found_lk_backend.model.User;
import com.example.lost_and_found_lk_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User saveUser(User user) {
        Optional<User> existingUser = userRepository.findByEmail(user.getEmail());

        if (existingUser.isPresent()) {
            User dbUser = existingUser.get();
            // Update fields if necessary, but keep ID
            dbUser.setName(user.getName());
            dbUser.setPhotoUrl(user.getPhotoUrl());
            dbUser.setPhoneNumber(user.getPhoneNumber());
            dbUser.setAuthProvider(user.getAuthProvider());
            // Only update password if provided and not empty (for local auth updates)
            if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                dbUser.setPassword(passwordEncoder.encode(user.getPassword()));
            }
            return userRepository.save(dbUser);
        } else {
            // New user
            if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(user.getPassword()));
            }
            return userRepository.save(user);
        }
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
