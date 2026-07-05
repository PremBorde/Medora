# Medora AI

> AI-first healthcare navigation platform — helping patients understand symptoms, find specialists, and manage their health intelligently.

---

## Architecture

```
d:\Medora AI\
├── frontend/          # Next.js 15 App Router (JavaScript)
├── backend/           # Spring Boot 3.x + Spring AI + PostgreSQL
├── docs/              # Documentation
├── memory/            # AI assistant persistent memory
└── docker-compose.yml # Local infrastructure
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, JavaScript, Tailwind CSS, Shadcn UI, Framer Motion |
| Backend | Spring Boot 3.x, Spring Security, Spring AI |
| Database | PostgreSQL 16 + pgvector |
| AI | Gemini API via Spring AI |
| Cache | Redis |
| Auth | JWT (email/password) |

## Quick Start

### 1. Prerequisites
- Java 21+
- Node.js 20+
- Docker Desktop

### 2. Start Infrastructure
```bash
docker-compose up -d
```

### 3. Backend
```bash
cd backend
# Copy environment
cp ../.env.example .env
# Add your GEMINI API key to .env
./mvnw spring-boot:run
```

### 4. Frontend
```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Phase 1 MVP Features

- [x] JWT Authentication (register / login)
- [x] Patient profile management
- [x] AI symptom assessment (Gemini + Spring AI)
- [x] Urgency level scoring (LOW / MEDIUM / HIGH / EMERGENCY)
- [x] Specialist recommendation
- [x] Dashboard home
- [ ] Report upload + OCR (Phase 2)
- [ ] Health timeline (Phase 2)
- [ ] Appointment booking (Phase 3)

## AI Safety

Every AI response includes:
- `urgencyLevel` — LOW / MEDIUM / HIGH / EMERGENCY
- `confidence` — 0–100%
- `reasoning` — Transparent explanation
- `specialistType` — Recommended specialist
- `disclaimer` — "This is not a medical diagnosis..."

## Documentation

- [Product Requirements](docs/PRD.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database Schema](docs/DATABASE.md)
- [API Reference](docs/API.md)
- [AI Design](docs/AI_DESIGN.md)
- [Security](docs/SECURITY.md)
