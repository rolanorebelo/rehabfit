package com.rehabfit.controller;
import java.util.stream.Collectors;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rehabfit.service.RagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.util.Map;
import java.util.UUID;
import java.util.List;
import java.io.IOException;

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

@PostMapping("/chat/simple")
public ResponseEntity<?> chatSimple(@RequestBody Map<String, String> body, @RequestHeader("Authorization") String authHeader) {
    String question = body.get("question");
    String userId = ragService.getUserIdFromAuthHeader(authHeader);
    String answer = ragService.answerWithRagNonStreaming(userId, question);
    return ResponseEntity.ok(Map.of("answer", answer));
}

@PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public SseEmitter chatStream(@RequestBody Map<String, String> body, @RequestHeader("Authorization") String authHeader) {
    String question = body.get("question");
    String userId = ragService.getUserIdFromAuthHeader(authHeader);
    
    SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
    
    // Process in a separate thread to not block
    new Thread(() -> {
        try {
            ragService.answerWithRagAndVideosStreaming(userId, question, emitter);
            emitter.complete();
        } catch (Exception e) {
            emitter.completeWithError(e);
        }
    }).start();
    
    return emitter;
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
    List<Map<String, String>> urls = ragService.getYouTubeVideos(query, youtubeApiKey, 5);
    return ResponseEntity.ok(Map.of("urls", urls));
}
}