package com.medora.symptom.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public record SymptomRequest(
        @NotBlank(message = "Symptoms description is required")
        @Size(min = 10, max = 2000, message = "Symptoms must be between 10 and 2000 characters")
        String symptoms,

        Integer age,
        String gender,
        List<String> knownConditions,
        List<String> currentMedications,
        String additionalContext,

        /** Optional body-map region selected by the user (e.g. "chest", "head"). */
        String bodyLocation
) {}
