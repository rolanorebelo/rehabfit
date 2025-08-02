package com.rehabfit.model;

import lombok.Data;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Data
public class Progress {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String userId;
    private int painLevel;
    private int mobility;
    private int strength;
    private LocalDate date;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public int getPainLevel() { return painLevel; }
    public void setPainLevel(int painLevel) { this.painLevel = painLevel; }

    public int getMobility() { return mobility; }
    public void setMobility(int mobility) { this.mobility = mobility; }

    public int getStrength() { return strength; }
    public void setStrength(int strength) { this.strength = strength; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
}