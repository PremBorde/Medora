# Architecture — Medora AI

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    MEDORA AI SYSTEM                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────┐         ┌───────────────────────┐    │
│  │   Next.js 15  │  HTTPS  │   Spring Boot 3.x     │    │
│  │  (Frontend)   │◄───────►│   (Backend/AI Hub)    │    │
│  │  Port: 3000   │  REST   │   Port: 8080          │    │
│  └───────────────┘         └──────────┬────────────┘    │
│                                       │                  │
│                        ┌─────────────┴──────────────┐   │
│                        │                            │   │
│                  ┌─────▼──────┐         ┌──────────▼─┐  │
│                  │ PostgreSQL  │         │ Gemini API  │  │
│                  │  + pgvector │         │  (Google)   │  │
│                  └────────────┘         └────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Frontend Architecture (Next.js 15 App Router)

```
src/app/
├── page.js                    # Landing page (public)
├── layout.js                  # Root layout + providers
├── (auth)/                    # Public auth routes
│   ├── login/page.js
│   └── register/page.js
└── (dashboard)/               # Protected routes
    ├── layout.js              # Auth guard + Sidebar + Header
    ├── dashboard/page.js
    ├── symptom-check/page.js
    └── profile/page.js
```

**State Management:** Zustand (auth store, persisted to localStorage)
**Data Fetching:** TanStack Query + Axios
**Forms:** React Hook Form + Zod validation
**Animations:** Framer Motion

## Backend Architecture (Spring Boot)

Package structure follows feature-based vertical slicing:

```
com.medora/
├── auth/          # Registration, login, JWT
├── patient/       # Patient entity, profile CRUD
├── symptom/       # AI analysis endpoint
├── config/        # Security, CORS, AI config
└── common/        # ApiResponse, exceptions
```

**AI Orchestration:** Spring AI `ChatClient` → Gemini API
**Prompt Templates:** External `.st` files (Spring AI PromptTemplate)
**Auth:** Stateless JWT (JJWT 0.12)
**DB Access:** Spring Data JPA (Hibernate)

## Data Flow — Symptom Analysis

```
User → Next.js → POST /api/symptoms/analyze
                          ↓
                    JwtAuthFilter validates token
                          ↓
                    SymptomController.analyze()
                          ↓
                    SymptomService.analyzeSymptoms()
                          ↓
                    PromptTemplate.render(patient context)
                          ↓
                    ChatClient → Gemini API
                          ↓
                    JSON response parsed
                          ↓
                    Safety override (EMERGENCY check)
                          ↓
                    SymptomResponse returned to frontend
                          ↓
                    UrgencyCard rendered with animations
```

## Security Model

- All `/api/**` routes require valid JWT except `/api/auth/**`
- JWT signed with HMAC-SHA256, configurable expiry (default 24h)
- Passwords hashed with BCrypt (cost factor 12)
- CORS restricted to known origins
- Patient entity implements UserDetails directly

## Database Schema (Key Tables)

**patients**
- `id` UUID PK
- `email` unique, not null
- `password_hash` not null
- `first_name`, `last_name`
- `date_of_birth`, `gender`, `blood_type`
- `height_cm`, `weight_kg`
- `allergies`, `chronic_conditions`, `current_medications`
- `created_at`, `updated_at`
