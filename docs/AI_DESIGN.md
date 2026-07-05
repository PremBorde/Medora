# AI Design — Medora AI

## Core Philosophy
Medora AI is an educational healthcare navigation tool. The AI **must never diagnose**.

## What the AI CAN do
- Summarize and understand symptoms
- Assign urgency level (LOW / MEDIUM / HIGH / EMERGENCY)
- Recommend a specialist type
- Provide educational information about related conditions
- Ask follow-up questions
- Summarize medical reports (Phase 2)

## What the AI MUST NOT do
- Use the word "diagnosis", "diagnose", or "you have [condition]"
- Give specific medication dosages or prescriptions
- Replace emergency services — always direct EMERGENCY cases to call 911

## Safety Fields (Required on Every Response)
| Field | Type | Purpose |
|-------|------|---------|
| `urgencyLevel` | `LOW\|MEDIUM\|HIGH\|EMERGENCY` | Triage guidance |
| `confidence` | `0–100` | Transparency on AI certainty |
| `reasoning` | `string` | Explainable AI — why this assessment |
| `specialistType` | `string` | Who to see |
| `disclaimer` | `string` | Always present, standardized |
| `seekImmediateCare` | `boolean` | Auto-true for EMERGENCY |

## Urgency Level Definitions
- **LOW** — Minor symptoms, no red flags. "Schedule an appointment when convenient."
- **MEDIUM** — Concerning but not urgent. "See a doctor within 24-48 hours."
- **HIGH** — Needs prompt attention. "Seek medical care today."
- **EMERGENCY** — Potentially life-threatening. "Call emergency services or go to the ER now."

## Prompt Engineering
- Prompt template: `backend/src/main/resources/prompts/symptom-analysis.st`
- Uses Spring AI `PromptTemplate` for variable substitution
- Patient context (age, gender, known conditions, medications) injected when available
- Response parsed as JSON — markdown code blocks stripped before parsing

## AI Safety Override (Backend Code)
```java
// Force seekImmediateCare=true when urgencyLevel=EMERGENCY
if ("EMERGENCY".equals(response.urgencyLevel())) {
    return new SymptomResponse(..., true, response.disclaimer());
}
```
This is a hard code-level override that cannot be bypassed by prompt injection.

## Gemini Model Config
- Model: `gemini-2.0-flash` (fast, sufficient for symptom assessment)
- Temperature: `0.3` (low — reduces hallucination, keeps responses focused)
- Max tokens: `2048`

## RAG Strategy (Phase 2)
- Trusted medical corpus: WHO guidelines, NHS conditions library, Mayo Clinic FAQs
- pgvector used for embedding storage
- RAG will ground AI responses in verified medical content
- Reduces hallucination risk significantly for Phase 2 report analysis
