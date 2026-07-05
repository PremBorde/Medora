# Architectural Decisions — Medora AI

---

## ADR-001: Monorepo Layout
**Date:** 2026-07-04
**Status:** Accepted
**Decision:** Frontend and backend in a single repo under `d:\Medora AI\`
**Reason:** Easier to keep documentation, memory, and Docker compose in sync during early-stage development.

---

## ADR-002: JavaScript (no TypeScript) for Frontend
**Date:** 2026-07-04
**Status:** Accepted
**Decision:** Use plain JavaScript for Next.js frontend
**Reason:** User preference. JSDoc comments will be used for critical APIs to maintain clarity.
**Trade-off:** Less compile-time safety; mitigated by Zod runtime validation.

---

## ADR-003: Spring Boot as AI Orchestrator
**Date:** 2026-07-04
**Status:** Accepted
**Decision:** All AI calls (Gemini) made from Spring Boot backend via Spring AI — not from Next.js API routes.
**Reason:** Security (API key never exposed to frontend), centralized logging, easier rate-limiting, Spring AI prompt templates.

---

## ADR-004: JWT Auth (Phase 1, no OAuth)
**Date:** 2026-07-04
**Status:** Accepted
**Decision:** Email/password JWT auth only for Phase 1. Google OAuth deferred to Phase 2.
**Reason:** Faster to ship. OAuth adds complexity (session management, callback URLs, provider config).

---

## ADR-005: Docker Compose for Local DB
**Date:** 2026-07-04
**Status:** Accepted
**Decision:** PostgreSQL + pgvector + Redis via Docker Compose. No local installs needed.
**Reason:** Reproducible environment for all developers. pgvector used for future RAG embeddings.

---

## ADR-006: Shadcn UI (manually copied, not CLI)
**Date:** 2026-07-04
**Status:** Accepted
**Decision:** Shadcn components are written directly into the codebase rather than via `npx shadcn-ui add`.
**Reason:** Cannot run CLI in current environment. All components customized to match Medora's design system.

---

## ADR-007: Urgency Levels (4-tier)
**Date:** 2026-07-04
**Status:** Accepted
**Decision:** AI always returns one of: LOW | MEDIUM | HIGH | EMERGENCY
**Reason:** Clear, actionable, maps to color-coded UI. EMERGENCY always triggers "seek immediate medical care" advisory.

---

## ADR-008: Prompt Template Externalized
**Date:** 2026-07-04
**Status:** Accepted
**Decision:** Spring AI prompt template stored in `resources/prompts/symptom-analysis.st`
**Reason:** Allows prompt iteration without redeployment. Easier to audit and review.
