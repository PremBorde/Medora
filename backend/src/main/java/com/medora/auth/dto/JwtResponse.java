package com.medora.auth.dto;

public record JwtResponse(
        String token,
        String type,
        String email,
        String firstName,
        String lastName
) {
    public JwtResponse(String token, String email, String firstName, String lastName) {
        this(token, "Bearer", email, firstName, lastName);
    }
}
