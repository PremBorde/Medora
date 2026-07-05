package com.medora.symptom.dto;

import jakarta.validation.constraints.NotBlank;

public record ExplainRequest(
        @NotBlank(message = "Metric name is required")
        String metricName,

        @NotBlank(message = "Value is required")
        String value
) {}
