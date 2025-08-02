package com.rehabfit.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class TestController {

    @GetMapping("/test")
    public String securedEndpoint() {
        return "✅ Hello, you have accessed a secured endpoint!";
    }

    @GetMapping("/profile")
    public ProfileResponse getProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = (String) auth.getPrincipal();
        return new ProfileResponse(email);
    }

    static class ProfileResponse {
        private String email;

        public ProfileResponse(String email) {
            this.email = email;
        }

        public String getEmail() {
            return email;
        }
    }
}
