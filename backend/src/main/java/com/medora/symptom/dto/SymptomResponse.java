package com.medora.symptom.dto;

import java.util.List;

/**
 * Response shape returned by the symptom-analysis pipeline.
 * <p>
 * urgencyLevel values: HOME_CARE | ROUTINE | URGENT | EMERGENCY
 * seekImmediateCare is derived (true when urgencyLevel == EMERGENCY).
 * simpleSummary: short, warm, plain-language sentence for patients (max ~20 words).
 * clinicalDetail: full clinical reasoning shown only on user request.
 */
public record SymptomResponse(
        // Complete Assessment fields
        String urgencyLevel,          // HOME_CARE | ROUTINE | URGENT | EMERGENCY
        String simpleSummary,         // Short plain-language summary for patients (~20 words)
        String clinicalDetail,        // Full clinical reasoning — shown in expandable section
        List<String> redFlags,        // Populated by triage engine and/or LLM
        String recommendedAction,     // Concise next step for the patient
        String specialistType,        // e.g. "Cardiologist", "General Physician"
        List<String> homeCareSteps,   // Self-care instructions (populated for HOME_CARE / ROUTINE)
        boolean seekImmediateCare,    // true when urgencyLevel == EMERGENCY
        String disclaimer,            // Always present
        String basisLine,             // Honest non-numeric basis line listing inputs that drove the classification

        // Clarification Needed fields
        String responseType,          // "ASSESSMENT_COMPLETE" | "CLARIFICATION_NEEDED"
        String question,
        String questionType,          // "LOCATION_REFINE" | "SEVERITY_SCALE" | "ICON_CHOICE" | "DURATION_PICK" | "FREE_TEXT" | "YES_NO"
        
        // Widget-specific parameters
        String parentRegion,
        List<String> subRegions,
        Integer minSeverity,
        Integer maxSeverity,
        String minLabel,
        String maxLabel,
        List<String> quickReplyOptions,
        List<IconChoiceOption> iconOptions,
        String placeholder
) {
    public record IconChoiceOption(String id, String label, String icon) {}
}
