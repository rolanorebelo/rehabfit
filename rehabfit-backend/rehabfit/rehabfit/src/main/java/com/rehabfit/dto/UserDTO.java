package com.rehabfit.dto;

public class UserDTO {
    private String name;
    private String email;
    private String fitnessGoal;
    private String injuryType;

    public UserDTO() {}

    public UserDTO(String name, String email, String fitnessGoal, String injuryType) {
        this.name = name;
        this.email = email;
        this.fitnessGoal = fitnessGoal;
        this.injuryType = injuryType;
    }

    // Getters
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getFitnessGoal() { return fitnessGoal; }
    public String getInjuryType() { return injuryType; }

    // Setters
    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setFitnessGoal(String fitnessGoal) { this.fitnessGoal = fitnessGoal; }
    public void setInjuryType(String injuryType) { this.injuryType = injuryType; }
}
