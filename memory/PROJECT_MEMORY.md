# Project Memory — Medora AI

## What is Medora AI?
An AI-first healthcare navigation platform. Patients interact with an AI copilot to understand symptoms, get urgency assessments, find the right specialist, upload/understand medical reports, and track their health over time.

## Core Philosophy
- **AI is the center** — not a feature bolt-on
- **Not** a hospital management system, medical store, or CRUD app
- **Educational and safe** — never diagnoses, always disclaims

## Tech Stack
- Frontend: Next.js 15 App Router, JavaScript, Tailwind CSS, Shadcn UI, Framer Motion
- Backend: Spring Boot 3.x, Spring Security, Spring AI, JPA
- Database: PostgreSQL 16 + pgvector
- AI: Gemini API (Google) via Spring AI
- Cache: Redis (optional)
- Auth: JWT (email/password, Phase 1)
- Deployment: Docker + Vercel (frontend) + Render (backend)

## Monorepo Structure
```
d:\Medora AI\
├── frontend/   — Next.js app
├── backend/    — Spring Boot app
├── docs/       — All documentation
├── memory/     — This folder (AI memory)
└── docker-compose.yml
```

## Ports
- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## Database
- Name: medora_db
- User: medora_user
- Pass: medora_pass (dev only)

## AI Safety Rules (non-negotiable)
1. Never use the word "diagnose" or "diagnosis" in any AI output
2. Every response must include `disclaimer`, `confidence`, `reasoning`
3. EMERGENCY urgency → always advise "Seek immediate medical care"
4. AI may only: summarize symptoms, suggest urgency, recommend specialist type, provide educational info

## Key Design Decisions
- Monorepo (frontend + backend in same root)
- JavaScript only (no TypeScript) for frontend
- Spring Boot handles all AI orchestration (not Next.js API routes)
- Shadcn UI components used as base (not CDN, copied manually)
- Design inspiration: Linear, Stripe, Vercel, Apple Health
- Theme: Light, minimal, premium SaaS
- Colors: Blue (#4F6EF7) primary, Green (#10B981) accent

## Phase Plan
- Phase 1: Auth + Profile + AI Symptom Check + Dashboard (CURRENT)
- Phase 2: Report upload + OCR + AI summary + Health timeline
- Phase 3: Appointments + Notifications + Deployment

## Always Remember
Before any task: READ this file + CURRENT_PROGRESS.md + DECISIONS.md
After any task: UPDATE all three memory files
