package com.rehabfit.controller;

import com.rehabfit.service.OpenAiService;
import com.rehabfit.service.PineconeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AIController {
    @Autowired private OpenAiService openAiService;
    @Autowired private PineconeService pineconeService;

    @PostMapping("/chat")
    public Map<String, String> chat(@RequestBody Map<String, String> req, @RequestHeader("Authorization") String authHeader) {
        String userId = extractUserId(authHeader); // Implement JWT extraction
        String message = req.get("message");

        // 1. Embed user question
        var queryEmbedding = openAiService.createEmbedding(message);

        // 2. Query Pinecone for relevant user data
        List<String> contextChunks = pineconeService.queryRelevantTexts(queryEmbedding, userId);

        // 3. Construct prompt
        String prompt = "User Data:\n" + String.join("\n", contextChunks) + "\n\nQuestion: " + message;

        // 4. Get answer from OpenAI
        String reply = openAiService.chatCompletion(prompt);

        return Map.of("reply", reply);
    }

    private String extractUserId(String authHeader) {
        // ...your JWT logic...
        return "user-id";
    }
}