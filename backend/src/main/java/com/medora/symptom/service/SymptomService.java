package com.medora.symptom.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medora.symptom.dto.SymptomRequest;
import com.medora.symptom.dto.SymptomResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class SymptomService {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    @Value("classpath:prompts/symptom-analysis.st")
    private Resource symptomPromptTemplate;

    public SymptomResponse analyzeSymptoms(SymptomRequest request) {
        try {
            PromptTemplate template = new PromptTemplate(symptomPromptTemplate);

            String prompt = template.render(Map.of(
                    "symptoms", request.symptoms(),
                    "age", request.age() != null ? request.age().toString() : "Not provided",
                    "gender", request.gender() != null ? request.gender() : "Not provided",
                    "knownConditions", request.knownConditions() != null
                            ? String.join(", ", request.knownConditions())
                            : "None reported",
                    "medications", request.currentMedications() != null
                            ? String.join(", ", request.currentMedications())
                            : "None reported",
                    "additionalContext", request.additionalContext() != null
                            ? request.additionalContext()
                            : "None"
            ));

            String rawResponse = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            // Strip markdown code blocks if Gemini wraps the JSON
            String jsonResponse = rawResponse
                    .replaceAll("```json\\s*", "")
                    .replaceAll("```\\s*", "")
                    .trim();

            SymptomResponse response = objectMapper.readValue(jsonResponse, SymptomResponse.class);

            // Safety override: if EMERGENCY, always set seekImmediateCare
            if ("EMERGENCY".equals(response.urgencyLevel())) {
                return new SymptomResponse(
                        response.urgencyLevel(),
                        response.confidence(),
                        response.reasoning(),
                        response.specialistType(),
                        response.specialistReason(),
                        response.followUpQuestions(),
                        response.educationalSummary(),
                        true,  // force seekImmediateCare = true for EMERGENCY
                        response.disclaimer()
                );
            }

            return response;

        } catch (Exception e) {
            log.error("Error analyzing symptoms: {}", e.getMessage(), e);
            // Return a safe fallback response
            return new SymptomResponse(
                    "MEDIUM",
                    0,
                    "Unable to fully analyze symptoms at this time.",
                    "General Physician",
                    "A general physician can evaluate your symptoms and refer to specialists as needed.",
                    java.util.List.of(
                            "How long have you been experiencing these symptoms?",
                            "Are the symptoms getting better or worse?",
                            "Have you seen a doctor about these symptoms before?"
                    ),
                    "Please consult with a healthcare professional for a proper evaluation of your symptoms.",
                    false,
                    "This assessment is for educational purposes only and does not constitute medical advice, diagnosis, or treatment. Please consult a qualified healthcare professional."
            );
        }
    }

    public com.medora.symptom.dto.ExplainResponse explainMetric(com.medora.symptom.dto.ExplainRequest request) {
        try {
            String prompt = String.format(
                    "You are Medora AI, a safe healthcare navigation assistant. " +
                    "Explain what the metric '%s' with a value of '%s' means for a general patient user. " +
                    "Explain in exactly 2-3 simple, plain-language sentences. " +
                    "Do NOT provide any diagnosis. Keep it educational and empathetic. " +
                    "Do not repeat the disclaimer in the explanation.",
                    request.metricName(),
                    request.value()
            );

            String explanation = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content()
                    .trim();

            String disclaimer = "This assessment is for educational purposes only and does not constitute medical advice, diagnosis, or treatment. Please consult a qualified healthcare professional.";

            return new com.medora.symptom.dto.ExplainResponse(explanation, disclaimer);
        } catch (Exception e) {
            log.error("Error explaining metric: {}", e.getMessage(), e);
            return new com.medora.symptom.dto.ExplainResponse(
                    String.format("Your %s of %s represents a baseline indicator of your logged health metrics.", request.metricName(), request.value()),
                    "This assessment is for educational purposes only and does not constitute medical advice, diagnosis, or treatment. Please consult a qualified healthcare professional."
            );
        }
    }
}
