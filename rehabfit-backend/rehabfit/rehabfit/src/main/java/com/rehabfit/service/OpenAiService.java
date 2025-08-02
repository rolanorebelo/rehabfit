package com.rehabfit.service;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class OpenAiService {
    public List<Double> createEmbedding(String text) {
        // Call OpenAI embedding API and return embedding vector
        return List.of(); // stub
    }

    public String chatCompletion(String prompt) {
        // Call OpenAI chat/completion API and return response
        return "This is a stubbed AI response.";
    }
}