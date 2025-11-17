package com.rehabfit.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Service to prevent Render free tier cold starts by periodically pinging itself.
 * This is an internal keep-alive mechanism that runs on the backend.
 */
@Service
public class KeepAliveService {

    @Value("${server.port:8080}")
    private String serverPort;

    @Value("${app.keepalive.enabled:true}")
    private boolean keepAliveEnabled;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Pings the health endpoint every 10 minutes to keep the service warm.
     * Runs only if deployed (not on localhost).
     */
    @Scheduled(fixedRate = 600000) // 600,000 ms = 10 minutes
    public void pingHealthEndpoint() {
        if (!keepAliveEnabled) {
            return;
        }

        try {
            String healthUrl = "http://localhost:" + serverPort + "/api/rag/health";
            String response = restTemplate.getForObject(healthUrl, String.class);
            
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            System.out.println("[KEEP-ALIVE] " + timestamp + " - Health check: " + response);
        } catch (Exception e) {
            // Silently fail - this is just a keep-alive mechanism
            // Don't log errors to avoid cluttering production logs
        }
    }
}
