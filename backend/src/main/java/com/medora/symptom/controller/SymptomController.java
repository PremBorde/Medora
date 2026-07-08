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

    @PostMapping("/analyze")
    public ResponseEntity<SymptomResponse> analyze(@Valid @RequestBody SymptomRequest request) {
        SymptomResponse response = symptomService.analyzeSymptoms(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/explain")
    public ResponseEntity<com.medora.symptom.dto.ExplainResponse> explain(@Valid @RequestBody com.medora.symptom.dto.ExplainRequest request) {
        com.medora.symptom.dto.ExplainResponse response = symptomService.explainMetric(request);
        return ResponseEntity.ok(response);
    }
}
