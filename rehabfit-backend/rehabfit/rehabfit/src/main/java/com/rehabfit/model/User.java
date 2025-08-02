package com.rehabfit.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "app_user") 
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "created_at")
    @org.hibernate.annotations.CreationTimestamp
    private LocalDateTime createdAt;

     public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;

    private String injuryType;
    private String fitnessGoal;

    @ElementCollection
    @CollectionTable(
        name = "user_equipment_list",
        joinColumns = @JoinColumn(name = "user_id")
    )
    @Column(name = "equipment")
    private Set<String> equipmentList;
}
