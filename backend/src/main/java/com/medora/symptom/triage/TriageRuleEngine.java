package com.medora.symptom.triage;

import com.medora.symptom.dto.SymptomRequest;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Stateless, rule-based red-flag checker.
 * <p>
 * Runs BEFORE the LLM response is trusted and evaluates the raw symptom text
 * (plus optional body-location hint) against hard-coded emergency patterns.
 * If any rule matches, the caller must force {@code urgencyLevel = "EMERGENCY"}.
 * <p>
 * All matching is case-insensitive on the normalised input string.
 * No external dependencies — pure Java, no LLM calls.
 */
@Component
public class TriageRuleEngine {

    // -----------------------------------------------------------------------
    // Pre-compiled patterns (compiled once at class-load time)
    // -----------------------------------------------------------------------

    // Rule 1 — Cardiac: chest pain combined with at least one associated sign
    private static final Pattern CHEST_PAIN =
            Pattern.compile("\\bchest\\s+pain\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern CARDIAC_ASSOCIATED =
            Pattern.compile(
                    "shortness of breath|difficulty breathing|can'?t breathe|breathless|" +
                    "left arm|jaw pain|back pain|radiat|sweating|nausea|pressure in chest|" +
                    "tightness in chest|crushing|dizz|faint",
                    Pattern.CASE_INSENSITIVE);

    // Rule 2 — Thunderclap / SAH headache
    private static final Pattern THUNDERCLAP_HEADACHE =
            Pattern.compile(
                    "worst.{0,20}headache|sudden severe headache|" +
                    "worst headache of my life|worst headache i.?ve ever|" +
                    "thunderclap headache",
                    Pattern.CASE_INSENSITIVE);

    // Rule 3 — Stroke signs (FAST)
    private static final Pattern STROKE_SIGNS =
            Pattern.compile(
                    "one.?sided weakness|weakness\\s+on\\s+one\\s+side|" +
                    "facial\\s+droop|face\\s+(?:is\\s+)?droop(?:ing|ed)|" +
                    "slurred speech|arm weakness|leg weakness|" +
                    "sudden numbness|sudden confusion|sudden trouble speaking|" +
                    "sudden vision loss|sudden severe dizziness",
                    Pattern.CASE_INSENSITIVE);

    // Rule 4 — Uncontrolled bleeding
    private static final Pattern UNCONTROLLED_BLEEDING =
            Pattern.compile(
                    "uncontrolled bleeding|won'?t stop bleeding|can'?t stop.{0,10}bleeding|" +
                    "bleeding won'?t stop|spurting blood|massive bleeding|" +
                    "hemorrhage|haemorrhage",
                    Pattern.CASE_INSENSITIVE);

    // Rule 5 — Loss of consciousness / unresponsive
    private static final Pattern LOSS_OF_CONSCIOUSNESS =
            Pattern.compile(
                    "loss of consciousness|passed out|fainted|fainting|" +
                    "blacked out|blackout|unresponsive|unconscious",
                    Pattern.CASE_INSENSITIVE);

    // Rule 6 — Severe allergic reaction / anaphylaxis
    private static final Pattern ANAPHYLAXIS =
            Pattern.compile("anaphylaxis|anaphylactic", Pattern.CASE_INSENSITIVE);
    private static final Pattern THROAT_CLOSING =
            Pattern.compile(
                    "throat swelling|throat closing|throat is closing|" +
                    "can'?t swallow|swelling of.{0,20}throat",
                    Pattern.CASE_INSENSITIVE);
    private static final Pattern HIVES_WITH_BREATHING =
            Pattern.compile("hives|urticaria|rash", Pattern.CASE_INSENSITIVE);
    private static final Pattern BREATHING_DIFFICULTY =
            Pattern.compile(
                    "difficulty breathing|shortness of breath|can'?t breathe|" +
                    "trouble breathing|struggling to breathe",
                    Pattern.CASE_INSENSITIVE);

    // Rule 7 — High fever in infant under ~3 months
    private static final Pattern FEVER =
            Pattern.compile("\\bfever\\b|high temperature|high temp", Pattern.CASE_INSENSITIVE);
    private static final Pattern INFANT_KEYWORDS =
            Pattern.compile(
                    "\\binfant\\b|\\bnewborn\\b|\\bneonatal\\b|" +
                    "\\bbaby\\b|\\d+\\s*(?:week|day).?old|" +
                    "(?:one|two|three|1|2|3)\\s*month.?old",
                    Pattern.CASE_INSENSITIVE);

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    /**
     * Evaluates a {@link SymptomRequest} against all red-flag rules.
     *
     * @param request the incoming symptom submission
     * @return {@link RedFlagResult} with {@code triggered=true} and populated
     *         reasons if any rule fires; otherwise {@link RedFlagResult#clean()}
     */
    public RedFlagResult evaluate(SymptomRequest request) {
        // Normalise input — combine symptoms text and optional body location
        String combined = buildCombinedText(request);

        List<String> reasons = new ArrayList<>();

        checkCardiacEmergency(combined, reasons);
        checkThunderclapHeadache(combined, reasons);
        checkStrokeSigns(combined, reasons);
        checkUncontrolledBleeding(combined, reasons);
        checkLossOfConsciousness(combined, reasons);
        checkAnaphylaxis(combined, reasons);
        checkInfantFever(combined, request.age(), reasons);

        if (reasons.isEmpty()) {
            return RedFlagResult.clean();
        }
        return new RedFlagResult(true, List.copyOf(reasons));
    }

    // -----------------------------------------------------------------------
    // Private rule checks
    // -----------------------------------------------------------------------

    /** Rule 1: Chest pain + at least one cardiac-associated sign. */
    private void checkCardiacEmergency(String text, List<String> reasons) {
        if (CHEST_PAIN.matcher(text).find() && CARDIAC_ASSOCIATED.matcher(text).find()) {
            reasons.add("Chest pain with associated symptoms (shortness of breath, left arm pain, sweating, or pressure) — possible cardiac emergency.");
        }
    }

    /** Rule 2: Thunderclap / worst-ever headache — possible subarachnoid haemorrhage. */
    private void checkThunderclapHeadache(String text, List<String> reasons) {
        if (THUNDERCLAP_HEADACHE.matcher(text).find()) {
            reasons.add("Sudden or worst-ever severe headache reported — possible intracranial emergency (e.g. subarachnoid haemorrhage).");
        }
    }

    /** Rule 3: FAST stroke signs — one-sided weakness, facial droop, slurred speech, etc. */
    private void checkStrokeSigns(String text, List<String> reasons) {
        if (STROKE_SIGNS.matcher(text).find()) {
            reasons.add("Signs consistent with acute stroke detected (facial droop, one-sided weakness, slurred speech, or sudden neurological change).");
        }
    }

    /** Rule 4: Uncontrolled or severe bleeding. */
    private void checkUncontrolledBleeding(String text, List<String> reasons) {
        if (UNCONTROLLED_BLEEDING.matcher(text).find()) {
            reasons.add("Uncontrolled or severe bleeding reported — requires immediate emergency intervention.");
        }
    }

    /** Rule 5: Loss of consciousness or unresponsive state. */
    private void checkLossOfConsciousness(String text, List<String> reasons) {
        if (LOSS_OF_CONSCIOUSNESS.matcher(text).find()) {
            reasons.add("Loss of consciousness or unresponsive state reported — potential life-threatening emergency.");
        }
    }

    /**
     * Rule 6: Severe allergic reaction / anaphylaxis.
     * Triggers on (a) explicit anaphylaxis keyword, (b) throat closing, or
     * (c) hives/rash combined with breathing difficulty.
     */
    private void checkAnaphylaxis(String text, List<String> reasons) {
        boolean triggered = ANAPHYLAXIS.matcher(text).find()
                || THROAT_CLOSING.matcher(text).find()
                || (HIVES_WITH_BREATHING.matcher(text).find()
                        && BREATHING_DIFFICULTY.matcher(text).find());
        if (triggered) {
            reasons.add("Signs of severe allergic reaction or anaphylaxis detected (throat swelling, hives with breathing difficulty, or anaphylaxis keyword) — administer epinephrine if available and call emergency services.");
        }
    }

    /**
     * Rule 7: High fever in a very young infant (under ~3 months).
     * Uses both keyword heuristics in the text and the explicit {@code age} field
     * (if provided as months the caller should pass age in years with < 1 mapping).
     * Age-based check: age == 0 (i.e. < 1 year treated as under 3 months here)
     * combined with fever keywords.
     */
    private void checkInfantFever(String text, Integer age, List<String> reasons) {
        boolean feverPresent = FEVER.matcher(text).find();
        if (!feverPresent) return;

        // Heuristic 1: keyword indicators of a very young infant in the text
        boolean infantKeyword = INFANT_KEYWORDS.matcher(text).find();

        // Heuristic 2: explicit age field — age 0 means < 1 year (backend receives years).
        // We consider age == 0 (less than 1 year) as potentially under 3 months when
        // the submitted text contains infant/baby/newborn language.
        boolean ageUnderOne = (age != null && age == 0);

        if (infantKeyword || ageUnderOne) {
            reasons.add("Fever reported in what appears to be a very young infant (under 3 months) — this is a medical emergency; seek immediate care.");
        }
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    private String buildCombinedText(SymptomRequest request) {
        StringBuilder sb = new StringBuilder();
        if (request.symptoms() != null) sb.append(request.symptoms()).append(' ');
        if (request.bodyLocation() != null) sb.append(request.bodyLocation()).append(' ');
        if (request.additionalContext() != null) sb.append(request.additionalContext());
        return sb.toString();
    }
}
