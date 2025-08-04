package com.rehabfit.controller;

import org.springframework.dao.DataIntegrityViolationException;
import com.rehabfit.model.User;
import com.rehabfit.repository.UserRepository;
import com.rehabfit.security.JWTUtil;
import com.rehabfit.service.AuthService;
import com.rehabfit.service.RagService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.Map;
import java.util.HashMap;
import java.util.Collections;
import java.io.IOException;
import java.security.GeneralSecurityException;
import com.rehabfit.model.GoogleTokenRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final NetHttpTransport transport = new NetHttpTransport();
    private final JsonFactory jsonFactory = GsonFactory.getDefaultInstance();

    @Value("${google.oauth.client-id:477022837854-r1nt2k3r2bq6j5hcbf4d0t0t8lefpune.apps.googleusercontent.com}")
    private String googleClientId;

    @Autowired
    private AuthService authService;

    @Autowired
    private JWTUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RagService ragService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            // Basic validation
            if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Email is required"));
            }
            if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Password is required"));
            }

            User savedUser = authService.register(user);
            
            // Upsert user's name for personalization
            ragService.upsertUserProfile(
                savedUser.getId().toString(),
                savedUser.getName(),
                savedUser.getInjuryType(),
                savedUser.getFitnessGoal()
            );
            
            String token = jwtUtil.generateToken(savedUser.getEmail());
            return ResponseEntity.ok(new TokenResponse(token));
            
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "A user with this email already exists."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            // Basic validation
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Email is required"));
            }
            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Password is required"));
            }

            String token = authService.login(request.getEmail(), request.getPassword());
            
            // Update RAG system with user profile data
            userRepository.findByEmail(request.getEmail()).ifPresent(user ->
                ragService.upsertUserProfile(
                    user.getId().toString(), 
                    user.getName(), 
                    user.getInjuryType(), 
                    user.getFitnessGoal()
                )
            );
            
            return ResponseEntity.ok(new TokenResponse(token));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Login failed: " + e.getMessage()));
        }
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleAuth(@RequestBody GoogleTokenRequest request) {
        try {
            // Validate request
            if (request.getToken() == null || request.getToken().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Google token is required"));
            }

            // Verify the Google token
            String token = request.getToken();
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(transport, jsonFactory)
                .setAudience(Collections.singletonList(googleClientId))
                .build();

            GoogleIdToken idToken = verifier.verify(token);
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                String email = payload.getEmail();

                if (email == null || email.trim().isEmpty()) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Invalid Google token: no email found"));
                }

                // Find or create user
                User user = userRepository.findByEmail(email)
                    .orElseGet(() -> {
                        User newUser = new User();
                        newUser.setEmail(email);
                        newUser.setName((String) payload.get("name"));
                        return userRepository.save(newUser);
                    });

                // Upsert user's name for personalization
                ragService.upsertUserProfile(
                    user.getId().toString(), 
                    user.getName(), 
                    user.getInjuryType(), 
                    user.getFitnessGoal()
                );

                String jwt = jwtUtil.generateToken(email);
                return ResponseEntity.ok(new TokenResponse(jwt));
            }
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid Google token"));
                
        } catch (GeneralSecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Google token verification failed: " + e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Network error during Google token verification: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Google authentication failed: " + e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authorizationHeader) {
        try {
            if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Missing or invalid Authorization header"));
            }

            String token = authorizationHeader.substring(7); // remove "Bearer "
            String email = jwtUtil.validateTokenAndGetEmail(token);
            
            if (email == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid token"));
            }

            User user = userRepository.findByEmail(email)
                    .orElse(null);
            
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
            }

            return ResponseEntity.ok(user);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to get user: " + e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody ProfileUpdateRequest request, @RequestHeader("Authorization") String authorizationHeader) {
        try {
            if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Missing or invalid Authorization header"));
            }

            String token = authorizationHeader.substring(7);
            String email = jwtUtil.validateTokenAndGetEmail(token);
            
            if (email == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid token"));
            }

            User user = userRepository.findByEmail(email)
                .orElse(null);
            
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
            }

            // Validate input data
            if (!request.isValidAge()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid age value. Age must be between 1 and 150."));
            }
            if (!request.isValidWeight()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid weight value. Weight must be between 1 and 1000 kg."));
            }
            if (!request.isValidHeight()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid height value. Height must be between 1 and 300 cm."));
            }

            // Update user fields only if they are provided and not empty
            if (request.getName() != null && !request.getName().trim().isEmpty()) {
                user.setName(request.getName().trim());
            }
            if (request.getInjuryType() != null && !request.getInjuryType().trim().isEmpty()) {
                user.setInjuryType(request.getInjuryType());
            }
            if (request.getFitnessGoal() != null && !request.getFitnessGoal().trim().isEmpty()) {
                user.setFitnessGoal(request.getFitnessGoal());
            }
            if (request.getAge() != null && request.getAge() > 0) {
                user.setAge(request.getAge());
            }
            if (request.getWeight() != null && request.getWeight() > 0) {
                user.setWeight(request.getWeight());
            }
            if (request.getHeight() != null && request.getHeight() > 0) {
                user.setHeight(request.getHeight());
            }
            if (request.getActivityLevel() != null && !request.getActivityLevel().trim().isEmpty()) {
                user.setActivityLevel(request.getActivityLevel());
            }
            if (request.getInjuryDescription() != null) {
                user.setInjuryDescription(request.getInjuryDescription());
            }

            // Save updated user
            User updatedUser = userRepository.save(user);

            // Update RAG system with new profile data
            ragService.upsertUserProfile(
                updatedUser.getId().toString(),
                updatedUser.getName(),
                updatedUser.getInjuryType(),
                updatedUser.getFitnessGoal()
            );

            // Create response map
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Profile updated successfully");
            response.put("user", updatedUser);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to update profile: " + e.getMessage()));
        }
    }

    // Data Transfer Objects (DTOs)
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        private String email;
        private String password;

        // Validation methods
        public boolean isValid() {
            return email != null && !email.trim().isEmpty() && 
                   password != null && !password.trim().isEmpty();
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TokenResponse {
        private String token;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfileUpdateRequest {
        private String name;
        private String injuryType;
        private String fitnessGoal;
        private Integer age;
        private Double weight;
        private Double height;
        private String activityLevel;
        private String injuryDescription;

        // Validation methods
        public boolean isValidAge() {
            return age == null || (age > 0 && age <= 150);
        }
        
        public boolean isValidWeight() {
            return weight == null || (weight > 0 && weight <= 1000);
        }
        
        public boolean isValidHeight() {
            return height == null || (height > 0 && height <= 300);
        }

        public boolean hasValidData() {
            return (name != null && !name.trim().isEmpty()) ||
                   (injuryType != null && !injuryType.trim().isEmpty()) ||
                   (fitnessGoal != null && !fitnessGoal.trim().isEmpty()) ||
                   (age != null && age > 0) ||
                   (weight != null && weight > 0) ||
                   (height != null && height > 0) ||
                   (activityLevel != null && !activityLevel.trim().isEmpty()) ||
                   (injuryDescription != null);
        }
    }
}