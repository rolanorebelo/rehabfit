package com.rehabfit.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoogleTokenRequest {
    private String token;
    private String email;
    private String name;
}