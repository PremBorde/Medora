package com.medora.symptom.controller;

import com.medora.symptom.dto.SymptomRequest;
import com.medora.symptom.dto.SymptomResponse;
import com.medora.symptom.service.SymptomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/symptoms")
@RequiredArgsConstructor
public class SymptomController {

    private final SymptomService symptomService;
    private final com.medora.timeline.TimelineEventService timelineEventService;
    private final com.medora.patient.repository.PatientRepository patientRepository;

    @PostMapping("/analyze")
    public ResponseEntity<SymptomResponse> analyze(
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails,
            @Valid @RequestBody SymptomRequest request
    ) {
        SymptomResponse response = symptomService.analyzeSymptoms(request);
        if (userDetails != null) {
            try {
                java.util.UUID patientId = patientRepository.findByEmail(userDetails.getUsername())
                        .orElseThrow(() -> new com.medora.common.exception.ResourceNotFoundException("Patient not found"))
                        .getId();
                timelineEventService.logSymptomCheck(
                        patientId,
                        request.symptoms(),
                        response.urgencyLevel(),
                        response.specialistType()
                );
            } catch (Exception e) {
                // Fail silently so analysis results are still returned to the patient
            }
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/explain")
    public ResponseEntity<com.medora.symptom.dto.ExplainResponse> explain(@Valid @RequestBody com.medora.symptom.dto.ExplainRequest request) {
        com.medora.symptom.dto.ExplainResponse response = symptomService.explainMetric(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/test")
    public ResponseEntity<String> testGemini() {
        try {
            String res = symptomService.testDirectGemini();
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Gemini Connection Error: " + e.getClass().getName() + " -> " + e.getMessage());
        }
    }
}
