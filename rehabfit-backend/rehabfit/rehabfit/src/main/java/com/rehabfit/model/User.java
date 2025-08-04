package com.rehabfit.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.time.LocalDate;
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

    // Additional profile fields
    private Integer age;
    
    private Double weight; // in kg
    
    private Double height; // in cm
    
    private String activityLevel; // sedentary, light, moderate, active, athlete
    
    @Column(columnDefinition = "TEXT")
    private String injuryDescription;
    
    private LocalDate injuryDate;

    @ElementCollection
    @CollectionTable(
        name = "user_equipment_list",
        joinColumns = @JoinColumn(name = "user_id")
    )
    @Column(name = "equipment")
    private Set<String> equipmentList;

    // Getters and setters for new fields
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }

    public Double getHeight() { return height; }
    public void setHeight(Double height) { this.height = height; }

    public String getActivityLevel() { return activityLevel; }
    public void setActivityLevel(String activityLevel) { this.activityLevel = activityLevel; }

    public String getInjuryDescription() { return injuryDescription; }
    public void setInjuryDescription(String injuryDescription) { this.injuryDescription = injuryDescription; }

    public LocalDate getInjuryDate() { return injuryDate; }
    public void setInjuryDate(LocalDate injuryDate) { this.injuryDate = injuryDate; }
}