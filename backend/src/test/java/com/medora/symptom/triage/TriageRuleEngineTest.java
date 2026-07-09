package com.medora.symptom.triage;

import com.medora.symptom.dto.SymptomRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Pure unit tests for {@link TriageRuleEngine}.
 * No Spring context needed — the engine is plain Java.
 */
class TriageRuleEngineTest {

    private TriageRuleEngine engine;

    @BeforeEach
    void setUp() {
        engine = new TriageRuleEngine();
    }

    // -------------------------------------------------------------------------
    // Helper builder — avoids positional constructor noise
    // -------------------------------------------------------------------------
    private static SymptomRequest req(String symptoms) {
        return new SymptomRequest(symptoms, null, null, null, null, null, null);
    }

    private static SymptomRequest req(String symptoms, Integer age, String bodyLocation) {
        return new SymptomRequest(symptoms, age, null, null, null, null, bodyLocation);
    }

    // =========================================================================
    // RED-FLAG POSITIVE CASES (each rule must trigger)
    // =========================================================================

    @Nested
    @DisplayName("Rule 1 — Cardiac emergency")
    class CardiacEmergency {

        @Test
        @DisplayName("Chest pain + shortness of breath → EMERGENCY trigger")
        void chestPainWithShortness() {
            var result = engine.evaluate(req("I have chest pain and shortness of breath"));
            assertTriggered(result, "cardiac");
        }

        @Test
        @DisplayName("Chest pain + left arm pain → EMERGENCY trigger")
        void chestPainWithLeftArm() {
            var result = engine.evaluate(req("Severe chest pain radiating to my left arm"));
            assertTriggered(result, "cardiac");
        }

        @Test
        @DisplayName("Chest pain + sweating → EMERGENCY trigger")
        void chestPainWithSweating() {
            var result = engine.evaluate(req("Chest pain and I'm sweating profusely"));
            assertTriggered(result, "cardiac");
        }

        @Test
        @DisplayName("Chest pain alone (no associated sign) → must NOT trigger Rule 1")
        void chestPainAloneNoTrigger() {
            // Isolated chest pain without any associated sign should not trip the cardiac rule
            var result = engine.evaluate(req("I have mild chest pain after eating spicy food"));
            // Rule 1 requires chest pain AND an associated sign — this should not trigger
            // (Note: other rules may still fire; we check Rule 1 reason specifically)
            boolean containsCardiacReason = result.reasons().stream()
                    .anyMatch(r -> r.toLowerCase().contains("cardiac"));
            assertThat(containsCardiacReason)
                    .as("Isolated chest pain without associated signs should not trigger the cardiac rule")
                    .isFalse();
        }
    }

    @Nested
    @DisplayName("Rule 2 — Thunderclap headache")
    class ThunderclapHeadache {

        @Test
        @DisplayName("'worst headache of my life' → EMERGENCY trigger")
        void worstHeadacheOfMyLife() {
            var result = engine.evaluate(req("This is the worst headache of my life, came on suddenly"));
            assertTriggered(result, "headache");
        }

        @Test
        @DisplayName("'sudden severe headache' → EMERGENCY trigger")
        void suddenSevereHeadache() {
            var result = engine.evaluate(req("I have a sudden severe headache that started 10 minutes ago"));
            assertTriggered(result, "headache");
        }

        @Test
        @DisplayName("'worst headache I've ever had' → EMERGENCY trigger")
        void worstHeadacheEver() {
            var result = engine.evaluate(req("Worst headache I've ever had, completely out of nowhere"));
            assertTriggered(result, "headache");
        }
    }

    @Nested
    @DisplayName("Rule 3 — Stroke signs (FAST)")
    class StrokeSigns {

        @Test
        @DisplayName("Facial droop → EMERGENCY trigger")
        void facialDroop() {
            var result = engine.evaluate(req("My face is drooping on one side and my speech is odd"));
            assertTriggered(result, "stroke");
        }

        @Test
        @DisplayName("Slurred speech → EMERGENCY trigger")
        void slurredSpeech() {
            var result = engine.evaluate(req("Suddenly slurred speech and I feel confused"));
            assertTriggered(result, "stroke");
        }

        @Test
        @DisplayName("One-sided weakness → EMERGENCY trigger")
        void oneSidedWeakness() {
            var result = engine.evaluate(req("I have one-sided weakness in my right arm and leg"));
            assertTriggered(result, "stroke");
        }
    }

    @Nested
    @DisplayName("Rule 4 — Uncontrolled bleeding")
    class UncontrolledBleeding {

        @Test
        @DisplayName("'uncontrolled bleeding' exact phrase → EMERGENCY trigger")
        void uncontrolledBleeding() {
            var result = engine.evaluate(req("There is uncontrolled bleeding from a deep wound"));
            assertTriggered(result, "bleeding");
        }

        @Test
        @DisplayName("'won't stop bleeding' → EMERGENCY trigger")
        void wontStopBleeding() {
            var result = engine.evaluate(req("The cut on my leg won't stop bleeding after 30 minutes"));
            assertTriggered(result, "bleeding");
        }
    }

    @Nested
    @DisplayName("Rule 5 — Loss of consciousness")
    class LossOfConsciousness {

        @Test
        @DisplayName("'passed out' → EMERGENCY trigger")
        void passedOut() {
            var result = engine.evaluate(req("My husband passed out and is not responding"));
            assertTriggered(result, "consciousness");
        }

        @Test
        @DisplayName("'unresponsive' → EMERGENCY trigger")
        void unresponsive() {
            var result = engine.evaluate(req("Patient is unresponsive and won't wake up"));
            assertTriggered(result, "consciousness");
        }

        @Test
        @DisplayName("'loss of consciousness' exact phrase → EMERGENCY trigger")
        void lossOfConsciousnessPhrase() {
            var result = engine.evaluate(req("He experienced a sudden loss of consciousness"));
            assertTriggered(result, "consciousness");
        }
    }

    @Nested
    @DisplayName("Rule 6 — Anaphylaxis / severe allergic reaction")
    class Anaphylaxis {

        @Test
        @DisplayName("'anaphylaxis' keyword → EMERGENCY trigger")
        void anaphylaxisKeyword() {
            var result = engine.evaluate(req("I think I'm having anaphylaxis after eating peanuts"));
            assertTriggered(result, "allergic");
        }

        @Test
        @DisplayName("Throat closing → EMERGENCY trigger")
        void throatClosing() {
            var result = engine.evaluate(req("My throat is closing up, I can barely breathe"));
            assertTriggered(result, "allergic");
        }

        @Test
        @DisplayName("Hives + difficulty breathing → EMERGENCY trigger")
        void hivesWithBreathing() {
            var result = engine.evaluate(req("I broke out in hives and now have difficulty breathing"));
            assertTriggered(result, "allergic");
        }
    }

    @Nested
    @DisplayName("Rule 7 — Infant high fever")
    class InfantFever {

        @Test
        @DisplayName("'fever' + 'newborn' keyword → EMERGENCY trigger")
        void feverNewborn() {
            var result = engine.evaluate(req("My newborn has a high fever of 39°C", null, null));
            assertTriggered(result, "infant");
        }

        @Test
        @DisplayName("'fever' + 'baby' keyword → EMERGENCY trigger")
        void feverBaby() {
            var result = engine.evaluate(req("My 2 month old baby has a fever"));
            assertTriggered(result, "infant");
        }

        @Test
        @DisplayName("Fever + age=0 (under 1 year) + infant keyword → EMERGENCY trigger")
        void feverAgeZeroWithInfantKeyword() {
            var result = engine.evaluate(req("My infant has a high temperature", 0, null));
            assertTriggered(result, "infant");
        }
    }

    // =========================================================================
    // NON-EMERGENCY CASES (must NOT trigger any rule)
    // =========================================================================

    @Nested
    @DisplayName("Non-emergency cases")
    class NonEmergency {

        @Test
        @DisplayName("Mild cold symptoms → clean result")
        void mildCold() {
            var result = engine.evaluate(req(
                    "I have a runny nose, sore throat, and slight cough. Started yesterday. No fever."));
            assertClean(result);
        }

        @Test
        @DisplayName("Minor ankle sprain → clean result")
        void ankleSprain() {
            var result = engine.evaluate(req(
                    "I twisted my ankle playing football. It's slightly swollen and sore to walk on."));
            assertClean(result);
        }

        @Test
        @DisplayName("Mild indigestion / stomach ache → clean result")
        void mildStomachAche() {
            var result = engine.evaluate(req(
                    "I have a mild stomach ache after eating a large meal. Some bloating and burping."));
            assertClean(result);
        }

        @Test
        @DisplayName("Headache without thunderclap qualifiers → clean result")
        void ordinaryHeadache() {
            var result = engine.evaluate(req(
                    "I have a moderate headache that started a few hours ago. Paracetamol hasn't fully helped."));
            assertClean(result);
        }

        @Test
        @DisplayName("General fatigue and low mood → clean result")
        void fatigueAndMood() {
            var result = engine.evaluate(req(
                    "I've been feeling very tired for the past two weeks and my mood has been low."));
            assertClean(result);
        }
    }

    // =========================================================================
    // ASSERTION HELPERS
    // =========================================================================

    /** Asserts that the engine triggered and the reasons contain the expected keyword. */
    private void assertTriggered(RedFlagResult result, String reasonKeyword) {
        assertThat(result.triggered())
                .as("Expected red-flag engine to trigger but it did not")
                .isTrue();
        assertThat(result.reasons())
                .as("Reasons list should not be empty when triggered")
                .isNotEmpty();
        assertThat(result.reasons().stream().anyMatch(r -> r.toLowerCase().contains(reasonKeyword)))
                .as("Expected reason containing '%s' but got: %s", reasonKeyword, result.reasons())
                .isTrue();
    }

    /** Asserts that the engine produced a clean (no red flags) result. */
    private void assertClean(RedFlagResult result) {
        assertThat(result.triggered())
                .as("Expected no red-flag trigger but engine fired. Reasons: %s", result.reasons())
                .isFalse();
        assertThat(result.reasons())
                .as("Reasons list should be empty for a clean result")
                .isEmpty();
    }
}
