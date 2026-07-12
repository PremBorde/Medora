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
        return new SymptomRequest(symptoms, null, null, null, null, null, null, null);
    }

    private static SymptomRequest req(String symptoms, Integer age, String bodyLocation) {
        return new SymptomRequest(symptoms, age, null, null, null, null, bodyLocation, null);
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
    // JACKSON DESERIALIZATION TEST
    // =========================================================================

    @Nested
    @DisplayName("Jackson deserialization compatibility")
    class JacksonDeserialization {

        @Test
        @DisplayName("Deserialize JSON with new simpleSummary + clinicalDetail fields")
        void testDeserializationWithMissingFields() throws Exception {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            String json = """
                {
                  "urgencyLevel": "HOME_CARE",
                  "simpleSummary": "You seem to be feeling mild discomfort that should pass with rest.",
                  "clinicalDetail": "The reported symptoms are consistent with mild indigestion or transient gastrointestinal upset.",
                  "basisLine": "Flagged due to: test description",
                  "redFlags": [],
                  "recommendedAction": "Rest at home",
                  "specialistType": "General Physician",
                  "homeCareSteps": ["Drink water", "Sleep"]
                }
                """;
            com.medora.symptom.dto.SymptomResponse response = mapper.readValue(json, com.medora.symptom.dto.SymptomResponse.class);
            assertThat(response).isNotNull();
            assertThat(response.urgencyLevel()).isEqualTo("HOME_CARE");
            assertThat(response.simpleSummary()).isEqualTo("You seem to be feeling mild discomfort that should pass with rest.");
            assertThat(response.clinicalDetail()).contains("indigestion");
            assertThat(response.basisLine()).isEqualTo("Flagged due to: test description");
            assertThat(response.seekImmediateCare()).isFalse(); // defaulted by Jackson/JVM for primitive boolean
            assertThat(response.disclaimer()).isNull(); // defaulted to null
        }

        @Test
        @DisplayName("Test prompt template rendering with placeholders")
        void testPromptTemplateRendering() throws Exception {
            org.springframework.core.io.ClassPathResource resource = new org.springframework.core.io.ClassPathResource("prompts/symptom-analysis.st");
            assertThat(resource.exists()).isTrue();
            
            // Read content
            java.io.InputStream in = resource.getInputStream();
            byte[] bytes = in.readAllBytes();
            String content = new String(bytes, java.nio.charset.StandardCharsets.UTF_8);
            
            org.springframework.ai.chat.prompt.PromptTemplate template = new org.springframework.ai.chat.prompt.PromptTemplate(content);
            String rendered = template.render(java.util.Map.of(
                "symptoms", "test symptoms description",
                "age", "30",
                "gender", "Male",
                "knownConditions", "None",
                "medications", "None",
                "additionalContext", "None",
                "bodyLocation", "head"
            ));
            assertThat(rendered).contains("test symptoms description");
            assertThat(rendered).contains("head");
        }

        @Test
        @DisplayName("Diagnose network connectivity to Gemini API")
        void testGeminiApiNetworkReachability() {
            String host = "generativelanguage.googleapis.com";
            int port = 443;
            int timeoutMs = 5000;
            
            try (java.net.Socket socket = new java.net.Socket()) {
                System.out.println("Attempting TCP connection to " + host + ":" + port + "...");
                socket.connect(new java.net.InetSocketAddress(host, port), timeoutMs);
                System.out.println("Successfully connected to " + host + "!");
                assertThat(socket.isConnected()).isTrue();
            } catch (Exception e) {
                System.err.println("CRITICAL: Cannot connect to Gemini API host: " + e.getClass().getName() + " -> " + e.getMessage());
                // Do not fail the build, just print the diagnostic warning
            }
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
