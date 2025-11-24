package com.example.lost_and_found_lk_backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String email;
    private String name;
    private String photoUrl;
    private String phoneNumber;
    private String authProvider; // "google" or "local"
    private String password; // Encrypted password for local auth
    private boolean blocked;
}
