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
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
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
        System.out.println("=== GOOGLE AUTH DEBUG ===");
        System.out.println("Request: " + request);
        
        try {
            // Validate request
            if (request.getToken() == null || request.getToken().trim().isEmpty()) {
                System.out.println("ERROR: Token is null or empty");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Google token is required"));
            }

            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                System.out.println("ERROR: Email is null or empty");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Email is required"));
            }

            System.out.println("Token: " + request.getToken().substring(0, Math.min(20, request.getToken().length())) + "...");
            System.out.println("Email: " + request.getEmail());
            System.out.println("Name: " + request.getName());

            // Verify the Google access token by calling Google's tokeninfo endpoint
            String token = request.getToken();
            String tokenInfoUrl = "https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=" + token;
            
            System.out.println("Calling Google tokeninfo API...");
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<Map> tokenInfoResponse = restTemplate.getForEntity(tokenInfoUrl, Map.class);
            
            System.out.println("Google API Response Status: " + tokenInfoResponse.getStatusCode());
            System.out.println("Google API Response Body: " + tokenInfoResponse.getBody());
            
            if (!tokenInfoResponse.getStatusCode().is2xxSuccessful()) {
                System.out.println("ERROR: Google API returned non-2xx status");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid Google token"));
            }

            Map<String, Object> tokenInfo = tokenInfoResponse.getBody();
            if (tokenInfo == null) {
                System.out.println("ERROR: Google API returned null body");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid Google token response"));
            }
            
            String tokenEmail = (String) tokenInfo.get("email");
            System.out.println("Token email from Google: " + tokenEmail);
            
            // Verify the email matches
            if (tokenEmail == null || !request.getEmail().equalsIgnoreCase(tokenEmail)) {
                System.out.println("ERROR: Email mismatch - Request: " + request.getEmail() + ", Token: " + tokenEmail);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Email mismatch"));
            }

            System.out.println("Finding or creating user...");
            // Find or create user
            User user = userRepository.findByEmail(request.getEmail())
                .orElseGet(() -> {
                    System.out.println("Creating new user for: " + request.getEmail());
                    User newUser = new User();
                    newUser.setEmail(request.getEmail());
                    newUser.setName(request.getName() != null ? request.getName() : request.getEmail());
                    return userRepository.save(newUser);
                });

            System.out.println("User found/created: " + user.getId());

            // Upsert user's name for personalization
            ragService.upsertUserProfile(
                user.getId().toString(), 
                user.getName(), 
                user.getInjuryType(), 
                user.getFitnessGoal()
            );

            System.out.println("Generating JWT...");
            String jwt = jwtUtil.generateToken(request.getEmail());
            System.out.println("SUCCESS: JWT generated");
            return ResponseEntity.ok(new TokenResponse(jwt));
                
        } catch (HttpClientErrorException e) {
            System.out.println("ERROR: HttpClientErrorException");
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid Google token: " + e.getMessage()));
        } catch (Exception e) {
            System.out.println("ERROR: Exception - " + e.getClass().getName());
            System.out.println("ERROR Message: " + e.getMessage());
            e.printStackTrace();
            String errorMsg = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Google authentication failed: " + errorMsg));
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