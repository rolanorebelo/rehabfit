package com.rehabfit.controller;
import org.springframework.dao.DataIntegrityViolationException;
import com.rehabfit.model.User;
import com.rehabfit.repository.UserRepository;
import com.rehabfit.security.JWTUtil;
import com.rehabfit.service.AuthService;
import com.rehabfit.service.RagService; // <-- Add this import
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import com.rehabfit.model.GoogleTokenRequest;
import org.springframework.http.HttpStatus;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import java.util.Collections;
import com.google.api.client.json.gson.GsonFactory;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final NetHttpTransport transport = new NetHttpTransport();
    private final JsonFactory jsonFactory = GsonFactory.getDefaultInstance();

    @Autowired
    private AuthService authService;

    @Autowired
    private JWTUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RagService ragService; // <-- Inject RagService

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
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
        String token = authService.login(request.getEmail(), request.getPassword());
        userRepository.findByEmail(request.getEmail()).ifPresent(user ->
            ragService.upsertUserProfile(user.getId().toString(), user.getName(), user.getInjuryType(), user.getFitnessGoal())
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
            // Verify the Google token
            String token = request.getToken();
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(transport, jsonFactory)
                .setAudience(Collections.singletonList("477022837854-r1nt2k3r2bq6j5hcbf4d0t0t8lefpune.apps.googleusercontent.com"))
                .build();

            GoogleIdToken idToken = verifier.verify(token);
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                String email = payload.getEmail();

                // Find or create user
                User user = userRepository.findByEmail(email)
                    .orElseGet(() -> {
                        User newUser = new User();
                        newUser.setEmail(email);
                        newUser.setName((String) payload.get("name"));
                        return userRepository.save(newUser);
                    });

                // Upsert user's name for personalization
                ragService.upsertUserProfile(user.getId().toString(), user.getName(), user.getInjuryType(), user.getFitnessGoal());

                String jwt = jwtUtil.generateToken(email);
                return ResponseEntity.ok(new TokenResponse(jwt));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
    }

    // Endpoint to fetch the current user (for /auth/me)
    @GetMapping("/me")
    public User getCurrentUser(@RequestHeader("Authorization") String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or invalid Authorization header");
        }

        String token = authorizationHeader.substring(7); // remove "Bearer "
        String email = jwtUtil.validateTokenAndGetEmail(token);
        if (email == null) {
            throw new RuntimeException("Invalid token");
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Data
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    @AllArgsConstructor
    public static class TokenResponse {
        private String token;
    }
}