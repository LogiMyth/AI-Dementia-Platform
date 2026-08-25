# SIH 2026 AI Dementia Platform

An offline-aware, safety-first PWA prototype for dementia support. It is not a diagnostic or prescribing system.

## Foundation status

Phase 1 provides the React PWA shell, Spring Boot API foundation, PostgreSQL migrations, seeded fictional demo accounts, JWT authentication, RBAC, audit logging, shared contracts, and accessibility-first design tokens.

## Prerequisites

- Node.js 22+ and npm
- Java 21+ and Maven 3.9+
- PostgreSQL 16+

## Setup

1. Copy `.env.example` to `.env` and set non-demo secrets.
2. Create database `dementia_platform` and user `dementia_app`.
3. Run API: `mvn spring-boot:run` from `apps/api`.
4. Run PWA: `npm install` then `npm run dev` from `apps/web`.

## Demo credentials

All data is fictional and seeded only in the `demo` profile.

| Role | Email | Password |
| --- | --- | --- |
| Caregiver | caregiver.asha@example.test | DemoPass123! |
| Patient B | patient.b@example.test | DemoPass123! |
| Reviewer | reviewer.isha@example.test | DemoPass123! |
| Administrator | admin@example.test | DemoPass123! |

## Planned demo journey

Patient routine/medication → check-in → deterministic insight → caregiver alert → acknowledgement and note. This is intentionally scheduled for Phase 2 and Phase 3 after the foundation is verified.

## Security and AI configuration

Secrets must remain in environment variables. The AI module will default to deterministic rules; no external provider is configured in the foundation.
