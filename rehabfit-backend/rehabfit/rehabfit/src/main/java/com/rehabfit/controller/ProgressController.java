package com.rehabfit.controller;

import com.rehabfit.model.Progress;
import com.rehabfit.repository.ProgressRepository;
import com.rehabfit.service.OpenAiService;
import com.rehabfit.service.PineconeService;
import com.rehabfit.security.JWTUtil;
import com.rehabfit.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {
    @Autowired private ProgressRepository progressRepository;
    @Autowired private OpenAiService openAiService;
    @Autowired private PineconeService pineconeService;
    @Autowired private JWTUtil jwtUtil;
    @Autowired private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> logProgress(@RequestBody Progress req, @RequestHeader("Authorization") String authHeader) {
        String userId = extractUserId(authHeader);

        // 1. Save to DB
        req.setUserId(userId);
        progressRepository.save(req);

        // 2. Prepare text and embed/upsert to Pinecone
        String text = String.format("Pain level %d, Mobility %d%%, Strength %d on %s",
                req.getPainLevel(), req.getMobility(), req.getStrength(), req.getDate());
        var embedding = openAiService.createEmbedding(text);
        pineconeService.upsert("progress-" + req.getId(), embedding, Map.of(
                "userId", userId, "text", text, "type", "progress", "date", req.getDate()
        ));

        return ResponseEntity.ok("Progress logged and indexed for RAG.");
    }

    // Store LLM suggestion in Pinecone for this user
    @PostMapping("/llm-suggestion")
    public ResponseEntity<?> logLlmSuggestion(@RequestBody Map<String, String> req, @RequestHeader("Authorization") String authHeader) {
        String userId = extractUserId(authHeader);
        String suggestion = req.getOrDefault("suggestion", "");
        if (suggestion.isBlank()) return ResponseEntity.badRequest().body("Missing suggestion text.");

        var embedding = openAiService.createEmbedding(suggestion);
        pineconeService.upsert("llm-suggestion-" + System.currentTimeMillis(), embedding, Map.of(
                "userId", userId, "text", suggestion, "type", "llm_suggestion"
        ));

        return ResponseEntity.ok("LLM suggestion logged and indexed for RAG.");
    }

    // Helper: Extract userId from JWT
    private String extractUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        String email = jwtUtil.validateTokenAndGetEmail(token);
        if (email == null) throw new RuntimeException("Invalid token");
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"))
            .getId().toString();
    }
}