package com.medora.symptom.dto;

import java.util.List;

public record SymptomResponse(
        String urgencyLevel,          // LOW | MEDIUM | HIGH | EMERGENCY
        Integer confidence,           // 0–100
        String reasoning,             // Transparent explanation
        String specialistType,        // e.g., "Cardiologist", "General Physician"
        String specialistReason,      // Why this specialist
        List<String> followUpQuestions,
        String educationalSummary,    // Educational info about the symptoms
        boolean seekImmediateCare,    // true when EMERGENCY
        String disclaimer             // Always present
) {}
