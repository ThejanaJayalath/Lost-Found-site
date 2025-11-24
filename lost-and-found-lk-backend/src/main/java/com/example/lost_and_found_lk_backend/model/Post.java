package com.example.lost_and_found_lk_backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Document(collection = "posts")
public class Post {
    @Id
    private String id;
    private String userId;

    private String title;
    private String description;
    private String location;
    private LocalDate date;
    private LocalTime time;
    private List<String> images;

    private ItemType type;
    private PostStatus status;

    private String color;

    // Type specific fields
    private String imei; // For Phones
    private String serialNumber; // For Laptops
    private String idNumber; // For IDs/Other

    // Contact info (Temporary until Auth is implemented)
    private String contactName;
    private String contactPhone;

    // User Display Info
    private String userName;
    private String userInitial;
}
