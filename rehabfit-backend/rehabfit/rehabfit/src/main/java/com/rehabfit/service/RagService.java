package com.rehabfit.service;

import com.theokanning.openai.completion.chat.ChatCompletionRequest;
import com.theokanning.openai.completion.chat.ChatCompletionResult;
import com.theokanning.openai.completion.chat.ChatCompletionChunk;
import com.theokanning.openai.completion.chat.ChatMessage;
import com.theokanning.openai.service.OpenAiService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import com.rehabfit.security.JWTUtil;
import com.rehabfit.repository.UserRepository;
import com.rehabfit.model.User;
import com.rehabfit.model.Progress;
import com.rehabfit.repository.ProgressRepository;
import java.util.stream.Collectors;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class RagService {
    private static final Logger log = LoggerFactory.getLogger(RagService.class);

    @Value("${pinecone.api.key}")
    private String pineconeApiKey;

    @Value("${pinecone.environment}")
    private String pineconeEnv;

    @Value("${pinecone.index}")
    private String pineconeIndex;

    @Value("${pinecone.project}")
    private String pineconeProject;

    @Value("${openai.api.key}")
    private String openAiApiKey;

    @Autowired
    private JWTUtil jwtUtil;

    @Value("${youtube.api.key}")
    private String youtubeApiKey;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProgressRepository progressRepository;

    // Extract userId from Authorization header (JWT)
    public String getUserIdFromAuthHeader(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7); // Remove "Bearer "
        String email = jwtUtil.validateTokenAndGetEmail(token);
        if (email == null) {
            throw new RuntimeException("Invalid token");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        // Convert userId to String if it's a Long
        return user.getId().toString();
    }

    // Personalized answer: only uses context for this user
    public Map<String, Object> answerWithRagAndVideos(String userId, String question) {
        try {
            List<Double> embedding = getHuggingFaceEmbedding(question);
            String context = queryPinecone(userId, embedding);

            // Optionally fetch from DB for latest info
            User user = userRepository.findById(Long.valueOf(userId)).orElse(null);
            StringBuilder profileContext = new StringBuilder();
            if (user != null) {
                profileContext.append("User Profile:\n");
                profileContext.append("Name: ").append(user.getName()).append("\n");
                profileContext.append("Injury Type: ").append(user.getInjuryType()).append("\n");
                profileContext.append("Fitness Goal: ").append(user.getFitnessGoal()).append("\n\n");
            }

            String fullContext = profileContext.toString() + context;
            String llmRawResponse = callOpenAI(question, fullContext);

            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> llmResponse;
            try {
                llmResponse = mapper.readValue(llmRawResponse, Map.class);
            } catch (Exception e) {
                // fallback if LLM didn't return JSON
                return Map.of("answer", llmRawResponse);
            }

            // Extract keywords from LLM's recommended videos
            List<Map<String, String>> llmVideos = (List<Map<String, String>>) llmResponse.get("videos");
            List<Map<String, String>> videos = new ArrayList<>();
            if (llmVideos != null) {
                for (Map<String, String> vid : llmVideos) {
                    String keyword = vid.get("title");
                    List<Map<String, String>> urls = getYouTubeVideos(keyword, youtubeApiKey, 0); // get real YouTube links
                    for (Map<String, String> url : urls) {
                        videos.add(Map.of("title", keyword, "url", url.get("url")));
                    }
                }
            }

            if (!videos.isEmpty()) {
                Map<String, Object> metadata = new HashMap<>();
                metadata.put("type", "recommendation");
                // Only store URLs as a list of strings for Pinecone metadata
                List<String> videoUrls = videos.stream()
                        .map(v -> v.get("url"))
                        .filter(Objects::nonNull)
                        .collect(Collectors.toList());
                metadata.put("videos", videoUrls);
                metadata.put("text", "Recommended videos for: " + question);

                String docId = "recommendations-" + userId + "-" + UUID.randomUUID();
                List<Double> recEmbedding = getHuggingFaceEmbedding(question);
                upsertToPinecone(userId, docId, question, recEmbedding, metadata);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("answer", llmResponse.get("answer"));
            response.put("videos", videos);
            return response;
        } catch (Exception e) {
            e.printStackTrace(); // This prints the error to the logs
            log.error("Error in answerWithRagAndVideos", e); // If using a logger
            return Map.of("answer", "Sorry, I couldn't process your request right now.");
        }
    }

    // Streaming version of answerWithRagAndVideos
    public void answerWithRagAndVideosStreaming(String userId, String question, SseEmitter emitter) {
        try {
            List<Double> embedding = getHuggingFaceEmbedding(question);
            String context = queryPinecone(userId, embedding);

            // Optionally fetch from DB for latest info
            User user = userRepository.findById(Long.valueOf(userId)).orElse(null);
            StringBuilder profileContext = new StringBuilder();
            if (user != null) {
                profileContext.append("You are assisting ").append(user.getName()).append(".\n");
                if (user.getInjuryType() != null && !user.getInjuryType().isEmpty()) {
                    profileContext.append("They have a ").append(user.getInjuryType()).append(" injury.\n");
                }
                if (user.getInjuryDescription() != null && !user.getInjuryDescription().isEmpty()) {
                    profileContext.append("Injury details: ").append(user.getInjuryDescription()).append(".\n");
                }
                if (user.getFitnessGoal() != null && !user.getFitnessGoal().isEmpty()) {
                    profileContext.append("Their fitness goal is ").append(user.getFitnessGoal()).append(".\n");
                }
                profileContext.append("\nPrevious conversation context:\n");
            }

            String fullContext = profileContext.toString() + context;
            
            // Stream the response
            callOpenAIStreaming(question, fullContext, emitter);
            
        } catch (Exception e) {
            e.printStackTrace();
            log.error("Error in answerWithRagAndVideosStreaming", e);
            try {
                emitter.send(SseEmitter.event()
                    .name("error")
                    .data("Sorry, I couldn't process your request right now."));
            } catch (IOException ioException) {
                log.error("Error sending error message", ioException);
            }
        }
    }

    // NON-STREAMING version - returns complete response at once
    public String answerWithRagNonStreaming(String userId, String question) {
        try {
            List<Double> embedding = getHuggingFaceEmbedding(question);
            String context = queryPinecone(userId, embedding);

            // Fetch user info
            User user = userRepository.findById(Long.valueOf(userId)).orElse(null);
            StringBuilder profileContext = new StringBuilder();
            if (user != null) {
                profileContext.append("You are assisting ").append(user.getName()).append(".\n");
                if (user.getInjuryType() != null && !user.getInjuryType().isEmpty()) {
                    profileContext.append("They have a ").append(user.getInjuryType()).append(" injury.\n");
                }
                if (user.getInjuryDescription() != null && !user.getInjuryDescription().isEmpty()) {
                    profileContext.append("Injury details: ").append(user.getInjuryDescription()).append(".\n");
                }
                if (user.getFitnessGoal() != null && !user.getFitnessGoal().isEmpty()) {
                    profileContext.append("Their fitness goal is ").append(user.getFitnessGoal()).append(".\n");
                }
                profileContext.append("\nPrevious conversation context:\n");
            }

            String fullContext = profileContext.toString() + context;
            
            // Call OpenAI without streaming
            return callOpenAINonStreaming(question, fullContext);
            
        } catch (Exception e) {
            log.error("Error in answerWithRagNonStreaming", e);
            return "Sorry, I couldn't process your request right now.";
        }
    }

    // Use HuggingFace all-MiniLM-L6-v2 embedding via Railway Python service
    public List<Double> getHuggingFaceEmbedding(String text) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            // Use Railway internal networking
            String url = "http://skillful-success.railway.internal:5005/embed";
            Map<String, String> request = Map.of("text", text);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            List<Double> embedding = (List<Double>) response.getBody().get("embedding");
            return embedding;
        } catch (Exception e) {
            // Embedding service unavailable - return dummy embedding or use fallback
            System.err.println("Embedding service unavailable: " + e.getMessage());
            // Return a dummy 384-dimensional embedding (all-MiniLM-L6-v2 dimension)
            List<Double> dummyEmbedding = new ArrayList<>();
            for (int i = 0; i < 384; i++) {
                dummyEmbedding.add(0.0);
            }
            return dummyEmbedding;
        }
    }

    public void deleteAllFromPinecone() {
        String url = String.format("https://%s-%s.svc.%s.pinecone.io/vectors/delete", pineconeIndex, pineconeProject, pineconeEnv);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Api-Key", pineconeApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        body.put("deleteAll", true);

        RestTemplate restTemplate = new RestTemplate();
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        restTemplate.postForEntity(url, entity, Map.class);
    }

    // Query Pinecone for this user's data only
    private String queryPinecone(String userId, List<Double> embedding) {
        List<Float> floatEmbedding = new ArrayList<>();
        for (Double d : embedding) floatEmbedding.add(d.floatValue());

        String url = String.format("https://%s-%s.svc.%s.pinecone.io/query", pineconeIndex, pineconeProject, pineconeEnv);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Api-Key", pineconeApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> filter = new HashMap<>();
        filter.put("userId", userId);

        Map<String, Object> body = new HashMap<>();
        body.put("vector", floatEmbedding);
        body.put("topK", 5);
        body.put("includeMetadata", true);
        body.put("filter", filter);

        RestTemplate restTemplate = new RestTemplate();
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

        StringBuilder sb = new StringBuilder();
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            List<Map<String, Object>> matches = (List<Map<String, Object>>) response.getBody().get("matches");
            if (matches != null) {
                for (Map<String, Object> match : matches) {
                    Map<String, Object> metadata = (Map<String, Object>) match.get("metadata");
                    if (metadata != null && metadata.containsKey("text")) {
                        sb.append(metadata.get("text")).append("\n");
                    }
                }
            }
        }
        return sb.toString();
    }

    /**
     * Upserts a document into Pinecone for a specific user.
     * @param userId The user to associate this data with
     * @param id Unique ID for the vector/document
     * @param text The text to store as metadata
     * @param embedding The embedding vector (List<Double>)
     */
    public void upsertToPinecone(String userId, String id, String text, List<Double> embedding, Map<String, Object> metadata) {
        try {
            List<Float> floatEmbedding = new ArrayList<>();
            for (Double d : embedding) floatEmbedding.add(d.floatValue());

            // Check if embedding contains only zeros (dummy embedding from unavailable service)
            boolean allZeros = floatEmbedding.stream().allMatch(f -> f == 0.0f);
            if (allZeros) {
                System.err.println("Skipping Pinecone upsert - embedding service unavailable (all zeros)");
                return;
            }

            String url = String.format("https://%s-%s.svc.%s.pinecone.io/vectors/upsert", pineconeIndex, pineconeProject, pineconeEnv);

            HttpHeaders headers = new HttpHeaders();
            headers.set("Api-Key", pineconeApiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> vector = new HashMap<>();
            vector.put("id", id);
            vector.put("values", floatEmbedding);

            // Fix: ensure metadata is not null before using it
            if (metadata == null) metadata = new HashMap<>();
            metadata.put("text", text);
            metadata.put("userId", userId); // associate with user
            vector.put("metadata", metadata);

            Map<String, Object> body = new HashMap<>();
            body.put("vectors", List.of(vector));

            RestTemplate restTemplate = new RestTemplate();
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            restTemplate.postForEntity(url, entity, Map.class);
        } catch (Exception e) {
            System.err.println("Failed to upsert to Pinecone: " + e.getMessage());
            // Continue without Pinecone - app still works
        }
    }

    /**
     * Upsert the user's name for personalization.
     * Call this after registration or login.
     */
    public void upsertUserProfile(String userId, String userName, String injuryType, String fitnessGoal) {
        String docId = "user-profile-" + userId;
        String text = "Name: " + userName + ". Injury Type: " + injuryType + ". Fitness Goal: " + fitnessGoal + ".";
        List<Double> embedding = getHuggingFaceEmbedding(text);
        upsertToPinecone(userId, docId, text, embedding, null);
    }

    public void upsertProgressToPinecone(String userId, Progress progress) {
        String docId = "progress-" + userId + "-" + progress.getId();
        String text = "Date: " + progress.getDate() + ", Pain: " + progress.getPainLevel() +
                      ", Mobility: " + progress.getMobility() + ", Strength: " + progress.getStrength();
        List<Double> embedding = getHuggingFaceEmbedding(text);
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("userId", userId);
        metadata.put("type", "progress");
        metadata.put("date", progress.getDate().toString());
        upsertToPinecone(userId, docId, text, embedding, metadata);
    }

    @SuppressWarnings("unchecked")
public List<Map<String, String>> getYouTubeVideos(String query, String apiKey, int maxResults) {
    String apiUrl = "https://www.googleapis.com/youtube/v3/search"
        + "?part=snippet"
        + "&maxResults=" + maxResults
        + "&q=" + URLEncoder.encode(query, StandardCharsets.UTF_8)
        + "&type=video"
        + "&key=" + apiKey;

    RestTemplate restTemplate = new RestTemplate();
    List<Map<String, String>> videos = new ArrayList<>();
    try {
        Map<String, Object> response = restTemplate.getForObject(apiUrl, Map.class);
        if (response == null) return videos;
        List<Map<String, Object>> items = (List<Map<String, Object>>) response.get("items");
        if (items != null && !items.isEmpty()) {
            for (Map<String, Object> item : items) {
                Map<String, Object> id = (Map<String, Object>) item.get("id");
                Map<String, Object> snippet = (Map<String, Object>) item.get("snippet");
                String videoId = id != null ? (String) id.get("videoId") : null;
                String title = snippet != null ? (String) snippet.get("title") : query;
                if (videoId != null && !videoId.isEmpty()) {
                    videos.add(Map.of("title", title, "url", "https://www.youtube.com/watch?v=" + videoId));
                }
            }
        }
    } catch (Exception e) {
        System.out.println("YouTube API error: " + e.getMessage());
    }
    return videos;
}

    // --- FIX: callOpenAI should accept the prompt directly ---
    private String callOpenAI(String question, String prompt) {
        OpenAiService service = new OpenAiService(openAiApiKey);

        ChatMessage systemMessage = new ChatMessage("system", "You are a helpful rehab assistant. Use the provided context to answer.");
        ChatMessage userMessage = new ChatMessage("user", prompt);

        ChatCompletionRequest request = ChatCompletionRequest.builder()
            .model("gpt-3.5-turbo")
            .messages(List.of(systemMessage, userMessage))
            .maxTokens(512)
            .temperature(0.2)
            .build();

        ChatCompletionResult result = service.createChatCompletion(request);
        return result.getChoices().get(0).getMessage().getContent();
    }

    // Streaming version of callOpenAI
    private void callOpenAIStreaming(String question, String prompt, SseEmitter emitter) {
        OpenAiService service = new OpenAiService(openAiApiKey);

        ChatMessage systemMessage = new ChatMessage("system", "You are a helpful rehab assistant speaking directly to the user. Use the provided context about the user to personalize your responses. Always respond in second person (using 'you/your'). Format your responses using markdown for better readability. Use:\n- **bold** for emphasis\n- Lists for steps or points\n- ## Headers for sections\n- `code blocks` for exercises or specific terms");
        ChatMessage userMessage = new ChatMessage("user", prompt + "\n\nUser's question: " + question);

        ChatCompletionRequest request = ChatCompletionRequest.builder()
            .model("gpt-3.5-turbo")
            .messages(List.of(systemMessage, userMessage))
            .maxTokens(512)
            .temperature(0.2)
            .stream(true)
            .build();

        try {
            service.streamChatCompletion(request)
                .doOnError(error -> {
                    log.error("Error streaming chat completion", error);
                    try {
                        emitter.send(SseEmitter.event()
                            .name("error")
                            .data("Error processing request"));
                        emitter.complete();
                    } catch (IOException e) {
                        log.error("Error sending error event", e);
                    }
                })
                .doOnComplete(() -> {
                    try {
                        emitter.send(SseEmitter.event()
                            .name("done")
                            .data("[DONE]"));
                    } catch (IOException e) {
                        log.error("Error sending completion event", e);
                    }
                })
                .blockingForEach(chunk -> {
                    try {
                        if (chunk.getChoices() != null && !chunk.getChoices().isEmpty()) {
                            var delta = chunk.getChoices().get(0).getMessage();
                            if (delta != null && delta.getContent() != null) {
                                String content = delta.getContent();
                                
                                // Add space before content if it's a word (not punctuation/markdown)
                                // This fixes OpenAI streaming which doesn't include spaces between tokens
                                if (content.length() > 0 && !content.matches("^[\\s.,!?;:\\-*#`\\[\\]()_~\\n].*")) {
                                    content = " " + content;
                                }
                                
                                log.info("Sending chunk: [{}]", content); // Debug logging
                                emitter.send(SseEmitter.event()
                                    .name("message")
                                    .data(content));
                            }
                        }
                    } catch (IOException e) {
                        log.error("Error sending chunk", e);
                        throw new RuntimeException(e);
                    }
                });
        } catch (Exception e) {
            log.error("Error in streaming completion", e);
            try {
                emitter.send(SseEmitter.event()
                    .name("error")
                    .data("Error during streaming"));
                emitter.complete();
            } catch (IOException ioException) {
                log.error("Error sending error event", ioException);
            }
        } finally {
            service.shutdownExecutor();
        }
    }

    // NON-STREAMING version of callOpenAI
    private String callOpenAINonStreaming(String question, String prompt) {
        OpenAiService service = new OpenAiService(openAiApiKey);

        ChatMessage systemMessage = new ChatMessage("system", "You are a helpful rehab assistant speaking directly to the user. Use the provided context about the user to personalize your responses. Always respond in second person (using 'you/your'). Format your responses using markdown for better readability. Use:\n- **bold** for emphasis\n- Lists for steps or points\n- ## Headers for sections\n- `code blocks` for exercises or specific terms");
        ChatMessage userMessage = new ChatMessage("user", prompt + "\n\nUser's question: " + question);

        ChatCompletionRequest request = ChatCompletionRequest.builder()
            .model("gpt-3.5-turbo")
            .messages(List.of(systemMessage, userMessage))
            .maxTokens(512)
            .temperature(0.2)
            .build();

        try {
            ChatCompletionResult result = service.createChatCompletion(request);
            return result.getChoices().get(0).getMessage().getContent();
        } finally {
            service.shutdownExecutor();
        }
    }

    // --- DASHBOARD DATA ---

   public Map<String, Object> getDashboardData(String userId) {
    User user = userRepository.findById(Long.valueOf(userId)).orElse(null);
    String createdAt = (user != null && user.getCreatedAt() != null) ? user.getCreatedAt().toString() : "";

    // Fetch progress data from DB
    List<Map<String, Object>> progressData = getProgressDataForUser(userId);

    // 1. Videos from user profile
    List<Map<String, String>> videos = new ArrayList<>();
    if (user != null) {
        List<String> keywords = new ArrayList<>();
        if (user.getInjuryType() != null) keywords.add(user.getInjuryType() + " rehab exercise");
        if (user.getFitnessGoal() != null) keywords.add(user.getFitnessGoal() + " exercise");

        for (String keyword : keywords) {
            videos.addAll(getYouTubeVideos(keyword, youtubeApiKey, 3)); // 3 per keyword
        }
    }

    System.out.println("Dashboard videos for user " + userId + " (profile): " + videos);

    // Build a summary of progress for the LLM
    StringBuilder progressSummary = new StringBuilder();
    for (Map<String, Object> entry : progressData) {
        progressSummary.append(String.format(
            "Date: %s, Pain: %s, Mobility: %s, Strength: %s\n",
            entry.get("date"), entry.get("painLevel"), entry.get("mobility"), entry.get("strength")
        ));
    }

    // Query Pinecone for context
    List<Double> embedding = getHuggingFaceEmbedding("dashboard summary for user");
    String pineconeContext = queryPinecone(userId, embedding);

    // Compose prompt for LLM
    String prompt = "You are a rehab assistant. Given the following user profile, progress logs, and previous recommendations, respond ONLY with a JSON object with these keys:\n" +
        "- estimatedRecovery: string\n" +
        "- dietPlan: array of strings\n" +
        "- llmSummary: array of strings (summarize recent progress and give actionable advice)\n" +
        "- videos: array of objects with 'title' (string) for recommended exercise video topics\n" +
        "User Profile:\n" +
        (user != null ? String.format("Name: %s, Injury Type: %s, Fitness Goal: %s\n", user.getName(), user.getInjuryType(), user.getFitnessGoal()) : "") +
        "Progress Logs:\n" + (progressSummary.length() > 0 ? progressSummary : "No progress yet.\n") +
        "Previous Recommendations:\n" + pineconeContext + "\n" +
        "Example:\n" +
        "{ \"estimatedRecovery\": \"4 weeks\", \"dietPlan\": [\"Eat more protein\", \"Stay hydrated\"], \"llmSummary\": [\"Mobility improved this week. Keep stretching!\", \"Try to reduce pain with ice therapy.\"], \"videos\": [{\"title\": \"ankle rehab exercises\"}, {\"title\": \"mobility stretches\"}] }\n" +
        "If there is no user data, return a generic JSON object with default advice. Return ONLY valid JSON. Do not include any explanation or extra text.";

    String llmRaw = callOpenAI("dashboard summary", prompt);
    System.out.println("LLM RAW OUTPUT: " + llmRaw);

    ObjectMapper mapper = new ObjectMapper();
    Map<String, Object> llmData = new HashMap<>();
    try {
        llmData = mapper.readValue(llmRaw, Map.class);
    } catch (Exception e) {
        llmData.put("estimatedRecovery", "N/A");
        llmData.put("dietPlan", List.of());
        llmData.put("llmSummary", List.of());
    }

    // 2. Videos from LLM recommendations
    if (llmData.containsKey("videos")) {
        List<Map<String, String>> llmVideos = (List<Map<String, String>>) llmData.get("videos");
        if (llmVideos != null) {
            for (Map<String, String> vid : llmVideos) {
                String keyword = vid.get("title");
                if (keyword != null && !keyword.isBlank()) {
                    videos.addAll(getYouTubeVideos(keyword, youtubeApiKey, 2)); // 2 per LLM keyword
                }
            }
        }
    }

    int recoveryPercentage = calculateRecoveryPercentage(progressData);

    Map<String, Object> result = new HashMap<>();
    result.put("createdAt", createdAt);
    result.put("estimatedRecovery", llmData.getOrDefault("estimatedRecovery", "N/A"));
    result.put("dietPlan", llmData.getOrDefault("dietPlan", List.of()));
    result.put("llmSummary", llmData.getOrDefault("llmSummary", List.of()));
    result.put("progressData", progressData);
    result.put("recoveryPercentage", recoveryPercentage);
    result.put("videos", videos);
    return result;
}

    private List<Map<String, Object>> getProgressDataForUser(String userId) {
        List<Progress> progresses = progressRepository.findByUserId(userId);
        List<Map<String, Object>> data = new ArrayList<>();
        for (Progress p : progresses) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("date", p.getDate().toString());
            entry.put("painLevel", p.getPainLevel());
            entry.put("mobility", p.getMobility());
            entry.put("strength", p.getStrength());
            data.add(entry);
        }
        return data;
    }

    private int calculateRecoveryPercentage(List<Map<String, Object>> progressData) {
        if (progressData.isEmpty()) return 0;
        double avgMobility = progressData.stream()
            .mapToInt(e -> (int) e.getOrDefault("mobility", 0))
            .average().orElse(0.0);
        return (int) Math.round((avgMobility / 10.0) * 100);
    }
}