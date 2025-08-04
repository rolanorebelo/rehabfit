package com.rehabfit.controller;
import java.util.stream.Collectors;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rehabfit.service.RagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Value;
import java.util.Map;
import java.util.UUID;
import java.util.List;

@RestController
@RequestMapping("/api/rag")
public class RagController {

    @Autowired
    private RagService ragService;

    @Value("${youtube.api.key}")
    private String youtubeApiKey;

    @PostMapping("/upsert-chat")
    public ResponseEntity<?> upsertChat(@RequestBody Map<String, String> body, @RequestHeader("Authorization") String authHeader) {
        String message = body.get("message");
        // Extract userId from JWT or session (implement this as needed)
        String userId = ragService.getUserIdFromAuthHeader(authHeader);
        String docId = UUID.randomUUID().toString();
        List<Double> embedding = ragService.getHuggingFaceEmbedding(message);
        ragService.upsertToPinecone(userId, docId, message, embedding, null);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/chat")
public ResponseEntity<?> chat(@RequestBody Map<String, String> body, @RequestHeader("Authorization") String authHeader) {
    String question = body.get("question");
    String userId = ragService.getUserIdFromAuthHeader(authHeader);
    Map<String, Object> llmResponse = ragService.answerWithRagAndVideos(userId, question);
    return ResponseEntity.ok(llmResponse);
}

@GetMapping("/dashboard")
public ResponseEntity<?> getDashboardData(@RequestHeader("Authorization") String authHeader) {
    String userId = ragService.getUserIdFromAuthHeader(authHeader);
    Map<String, Object> dashboard = ragService.getDashboardData(userId);
    return ResponseEntity.ok(dashboard);
}

@PostMapping("/pinecone/delete-all")
public ResponseEntity<?> deleteAllPinecone() {
    ragService.deleteAllFromPinecone();
    return ResponseEntity.ok("All Pinecone records deleted.");
}

@GetMapping("/test-youtube")
public ResponseEntity<?> testYouTube(@RequestParam String query) {
    List<Map<String, String>> urls = ragService.getYouTubeVideos(query, youtubeApiKey, 0);
    return ResponseEntity.ok(Map.of("urls", urls));
}
}