package com.rehabfit.service;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
public class PineconeService {
    public void upsert(String id, List<Double> embedding, Map<String, Object> metadata) {
        // Call Pinecone upsert API
    }

    public List<String> queryRelevantTexts(List<Double> queryEmbedding, String userId) {
        // Call Pinecone query API, filter by userId, return list of relevant texts
        return List.of("Sample user progress entry", "Another log entry");
    }
}