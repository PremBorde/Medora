package com.medora.symptom.dto;

import java.util.List;

/**
 * Response shape returned by the symptom-analysis pipeline.
 * <p>
 * urgencyLevel values: HOME_CARE | ROUTINE | URGENT | EMERGENCY
 * seekImmediateCare is derived (true when urgencyLevel == EMERGENCY).
 */
public record SymptomResponse(
        String urgencyLevel,          // HOME_CARE | ROUTINE | URGENT | EMERGENCY
        String reasoning,             // Step-by-step explanation (LLM-generated)
        List<String> redFlags,        // Populated by triage engine and/or LLM
        String recommendedAction,     // Concise next step for the patient
        String specialistType,        // e.g. "Cardiologist", "General Physician"
        List<String> homeCareSteps,   // Self-care instructions (populated for HOME_CARE / ROUTINE)
        boolean seekImmediateCare,    // true when urgencyLevel == EMERGENCY
        String disclaimer             // Always present
) {}
