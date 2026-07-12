package com.medora.symptom.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medora.symptom.dto.SymptomRequest;
import com.medora.symptom.dto.SymptomResponse;
import com.medora.symptom.triage.RedFlagResult;
import com.medora.symptom.triage.TriageRuleEngine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class SymptomService {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;
    private final TriageRuleEngine triageRuleEngine;

    @Value("classpath:prompts/symptom-analysis.st")
    private Resource symptomPromptTemplate;

    private static final String DISCLAIMER =
            "This assessment is for educational purposes only and does not constitute " +
            "medical advice, diagnosis, or treatment. Please consult a qualified healthcare " +
            "professional for proper evaluation.";

    public SymptomResponse analyzeSymptoms(SymptomRequest request) {
        try {
            // ----------------------------------------------------------------
            // 1. Build and render the prompt
            // ----------------------------------------------------------------
            PromptTemplate template = new PromptTemplate(symptomPromptTemplate);

            String prompt = template.render(Map.of(
                    "symptoms",          request.symptoms(),
                    "age",               request.age() != null ? request.age().toString() : "Not provided",
                    "gender",            request.gender() != null ? request.gender() : "Not provided",
                    "knownConditions",   request.knownConditions() != null
                                             ? String.join(", ", request.knownConditions())
                                             : "None reported",
                    "medications",       request.currentMedications() != null
                                             ? String.join(", ", request.currentMedications())
                                             : "None reported",
                    "additionalContext", request.additionalContext() != null
                                             ? request.additionalContext()
                                             : "None",
                    "bodyLocation",      request.bodyLocation() != null
                                             ? request.bodyLocation()
                                             : "Not specified",
                    "clarificationRound", request.clarificationRound() != null
                                             ? request.clarificationRound().toString()
                                             : "0"
            ));

            // ----------------------------------------------------------------
            // 2. Call LLM
            // ----------------------------------------------------------------
            String rawResponse = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            // Strip markdown code fences Gemini sometimes wraps around JSON
            String jsonResponse = rawResponse
                    .replaceAll("```json\\s*", "")
                    .replaceAll("```\\s*", "")
                    .trim();

            SymptomResponse llmResponse = objectMapper.readValue(jsonResponse, SymptomResponse.class);

            // ----------------------------------------------------------------
            // 3. Run rule-based triage safety layer
            // ----------------------------------------------------------------
            RedFlagResult triageResult = triageRuleEngine.evaluate(request);

            // Merge red flags from triage engine with any the LLM returned
            List<String> mergedRedFlags = new ArrayList<>();
            if (llmResponse.redFlags() != null) {
                mergedRedFlags.addAll(llmResponse.redFlags());
            }
            mergedRedFlags.addAll(triageResult.reasons());

            // Force ASSESSMENT_COMPLETE if we hit max rounds limit
            String finalResponseType = llmResponse.responseType();
            if ("CLARIFICATION_NEEDED".equals(finalResponseType) && request.clarificationRound() != null && request.clarificationRound() >= 2) {
                finalResponseType = "ASSESSMENT_COMPLETE";
            }

            // Force EMERGENCY if rule engine fired, regardless of LLM output
            String finalUrgency = triageResult.triggered()
                    ? "EMERGENCY"
                    : (llmResponse.urgencyLevel() != null ? llmResponse.urgencyLevel() : "ROUTINE");

            boolean seekImmediateCare = "EMERGENCY".equals(finalUrgency);

            String finalSummary = llmResponse.simpleSummary() != null
                    ? llmResponse.simpleSummary()
                    : (llmResponse.question() != null ? llmResponse.question() : "Please review the guidance below.");

            String finalDetail = llmResponse.clinicalDetail() != null
                    ? llmResponse.clinicalDetail()
                    : "Assessment compiled after clarification.";

            String finalBasisLine = null;
            if ("ASSESSMENT_COMPLETE".equals(finalResponseType)) {
                if (triageResult.triggered()) {
                    List<String> matchedDetails = new ArrayList<>();
                    String input = (request.symptoms() + " " + (request.bodyLocation() != null ? request.bodyLocation() : "") + " " + (request.additionalContext() != null ? request.additionalContext() : "")).toLowerCase();
                    if (input.contains("chest")) {
                        matchedDetails.add("chest pain");
                        if (input.contains("sweat")) matchedDetails.add("sweating");
                        if (input.contains("breath") || input.contains("shortness")) matchedDetails.add("breathlessness");
                        if (input.contains("arm")) matchedDetails.add("left arm pain");
                        if (input.contains("jaw")) matchedDetails.add("jaw pain");
                        if (input.contains("back")) matchedDetails.add("back pain");
                        if (input.contains("pressure") || input.contains("crush") || input.contains("tight")) matchedDetails.add("chest pressure/tightness");
                    } else if (input.contains("headache")) {
                        matchedDetails.add("severe headache");
                    } else if (input.contains("bleed")) {
                        matchedDetails.add("uncontrolled bleeding");
                    } else if (input.contains("conscious") || input.contains("pass") || input.contains("faint") || input.contains("unrespons")) {
                        matchedDetails.add("loss of consciousness");
                    } else if (input.contains("allerg") || input.contains("anaphyl") || input.contains("throat")) {
                        matchedDetails.add("anaphylaxis/throat swelling");
                    } else if (input.contains("fever") || input.contains("temp")) {
                        matchedDetails.add("infant high fever");
                    }
                    if (matchedDetails.isEmpty()) {
                        matchedDetails.addAll(triageResult.reasons());
                    }
                    finalBasisLine = "Flagged due to: " + String.join(" + ", matchedDetails);
                } else {
                    finalBasisLine = llmResponse.basisLine();
                }
            }

            return new SymptomResponse(
                    finalUrgency,
                    finalSummary,
                    finalDetail,
                    List.copyOf(mergedRedFlags),
                    llmResponse.recommendedAction() != null ? llmResponse.recommendedAction() : "Seek general medical checkup.",
                    llmResponse.specialistType() != null ? llmResponse.specialistType() : "General Physician",
                    llmResponse.homeCareSteps() != null ? llmResponse.homeCareSteps() : List.of(),
                    seekImmediateCare,
                    DISCLAIMER,
                    finalBasisLine,

                    // Clarification fields
                    finalResponseType != null ? finalResponseType : "ASSESSMENT_COMPLETE",
                    llmResponse.question(),
                    llmResponse.questionType(),
                    llmResponse.parentRegion(),
                    llmResponse.subRegions(),
                    llmResponse.minSeverity(),
                    llmResponse.maxSeverity(),
                    llmResponse.minLabel(),
                    llmResponse.maxLabel(),
                    llmResponse.quickReplyOptions(),
                    llmResponse.iconOptions(),
                    llmResponse.placeholder()
            );

        } catch (Exception e) {
            log.error("Error analyzing symptoms: {}", e.getMessage(), e);
            return fallbackResponse(e);
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

            return new com.medora.symptom.dto.ExplainResponse(explanation, DISCLAIMER);
        } catch (Exception e) {
            log.error("Error explaining metric: {}", e.getMessage(), e);
            return new com.medora.symptom.dto.ExplainResponse(
                    String.format("Your %s of %s represents a baseline indicator of your logged health metrics.",
                             request.metricName(), request.value()),
                    DISCLAIMER
            );
        }
    }

    public String testDirectGemini() {
        return chatClient.prompt()
                .user("Say hello back in exactly 3 words")
                .call()
                .content();
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    private SymptomResponse fallbackResponse(Exception e) {
        String errorDetail = e != null ? (e.getClass().getSimpleName() + ": " + e.getMessage()) : "Unknown error";
        return new SymptomResponse(
                "URGENT",
                "We weren't able to complete your analysis right now. Please try again in a moment.",
                "Backend Error: " + errorDetail,
                List.of(),
                "Seek medical attention as soon as possible given the inability to complete automated analysis.",
                "General Physician",
                List.of(
                        "Rest and monitor symptoms.",
                        "Keep a note of when symptoms started and any changes.",
                        "Seek medical advice if symptoms worsen."
                ),
                false,
                DISCLAIMER,
                "Error fallback",

                "ASSESSMENT_COMPLETE",
                null, null, null, null, null, null, null, null, null, null, null
        );
    }
}
