# 🛠️ UniPass – Technology Stack

> This document explains every technology choice in the UniPass stack, why it was chosen, and how it fits the product requirements.

---

## 📐 Architecture Overview

UniPass follows a **separated frontend/backend architecture** with a relational database. The backend exposes a REST API consumed by the frontend SPA. The database is the authoritative source of truth for all security-critical decisions.

```
┌─────────────────────────────────────┐
│            Browser (SPA)            │
│         React + TypeScript          │
│  React Router · React Query · Axios │
└──────────────┬──────────────────────┘
               │ HTTP / REST (JSON)
               │ Auth: Bearer JWT
┌──────────────▼──────────────────────┐
│           Backend API               │
│        Node.js + Express            │
│   Prisma ORM · JWT · Bcrypt · QR    │
└──────────────┬──────────────────────┘
               │ SQL + Transactions
┌──────────────▼──────────────────────┐
│           PostgreSQL 15+            │
│  Relational · Constraints · Locks   │
└─────────────────────────────────────┘
```

---

## 🖥️ Frontend

### Core Framework — React 18 + TypeScript

| Property | Detail |
|----------|--------|
| Library | React 18 |
| Language | TypeScript 5 |
| Bundler | Vite 5 |

**Why React?**
- Component model maps cleanly to UniPass UI primitives: movie cards, seat maps, ticket cards, scan results
- Hooks-based state management is simple enough for a university project
- TypeScript enforces shape contracts between frontend and backend, catching mismatches at compile time

**Why Vite?**
- Fast hot-module replacement during development
- Minimal configuration overhead vs. CRA or webpack

---

### Routing — React Router v6

- Declarative nested routes for the three role portals (public, student, guard, admin)
- Protected route wrappers enforce role-based navigation guards on the client (in addition to server enforcement)
- `useParams` for dynamic routes: `/screenings/:screeningId`, `/tickets/:ticketId`

---

### Server State & Data Fetching — TanStack React Query v5

**Why React Query?**
- Automatic cache invalidation after mutations (e.g. booking a seat re-fetches seat availability)
- Loading/error/success states are built-in, removing boilerplate
- Stale-while-revalidate pattern keeps seat availability reasonably fresh
- Pagination support for admin tables

---

### HTTP Client — Axios

- Interceptors inject the Bearer JWT on every authenticated request
- Interceptors handle 401 → redirect to login globally
- Consistent error shape extraction

---

### UI & Styling — Vanilla CSS + CSS Custom Properties

| Property | Detail |
|----------|--------|
| Approach | Vanilla CSS with CSS custom properties (design tokens) |
| Layout | CSS Grid + Flexbox |
| Fonts | Google Fonts — Inter (body), Outfit (headings) |

**Why Vanilla CSS?**
- Full control over the white/light + blue-accent university design system
- No utility-class conflicts or framework overrides
- CSS custom properties act as design tokens (colors, spacing, radii, shadows) for consistency

**Component patterns used:**
- Card components with consistent `border-radius`, `box-shadow`, `border`
- Status badge variants (valid, scanned, cancelled, occupied, available)
- Seat grid using CSS Grid with state-based classes
- Responsive layout via CSS Grid `auto-fill` / `minmax`

---

### QR Code Display — qrcode.react

- Renders the signed credential token as a QR code in the browser
- Accepts a string value; the raw JWT/signed token is passed in
- Displayed only on the Digital Ticket page — never shown as plain text

---

### QR Code Scanning — html5-qrcode

- Camera-based QR scanning in the Guard interface
- Scans from device camera in real time
- On successful decode, sends the raw payload to the backend — no client-side validation

---

### Form Management — React Hook Form + Zod

| Library | Role |
|---------|------|
| React Hook Form | Performant uncontrolled form state |
| Zod | Schema validation with TypeScript inference |

**Why this pair?**
- Zod schemas double as TypeScript types, keeping form shape and API shape in sync
- React Hook Form avoids re-renders on every keystroke
- Used for: Login, Register, all Admin CRUD forms, Screening creation, User management

---

### State Management — Zustand

- Lightweight global store for auth state (current user, token, role)
- Persisted to `localStorage` for session continuity
- Not used for server data (that lives in React Query cache)

---

## ⚙️ Backend

### Runtime & Framework — Node.js 20 LTS + Express 4

| Property | Detail |
|----------|--------|
| Runtime | Node.js 20 LTS |
| Framework | Express 4 |
| Language | TypeScript 5 |
| Execution | ts-node / tsx in dev, compiled JS in production |

**Why Express?**
- Minimal and composable — fits a modular by-feature structure
- Middleware pipeline is easy to reason about for auth, validation, error handling
- Widely understood for university project review

---

### ORM — Prisma 5

| Property | Detail |
|----------|--------|
| ORM | Prisma 5 |
| Schema file | `prisma/schema.prisma` |
| Migrations | Prisma Migrate |

**Why Prisma?**
- Schema-first: the `schema.prisma` file is the single source of truth for the database structure
- Auto-generated TypeScript client with full type inference (entity shapes, relation includes)
- Prisma Migrate produces auditable SQL migration files
- Supports raw SQL for atomic operations like the `VALID → SCANNED` conditional update

**Key Prisma schema features used:**
```prisma
// Unique composite constraint — seat double-booking prevention
@@unique([screeningId, seatId])  // on Ticket model

// Unique composite constraint — seat code uniqueness per screen
@@unique([screenId, seatCode])   // on Seat model
```

---

### Database — PostgreSQL 15+

**Why PostgreSQL?**
- Full ACID compliance — essential for atomic ticket state transitions and concurrent booking protection
- Row-level locking via `SELECT ... FOR UPDATE` or conditional UPDATE
- Native `ENUM` types for role, status, seat_type
- `UNIQUE` constraints enforced at the database engine level — the final safety net

**Critical database constraints:**
```sql
-- Prevents double-booking a seat for the same screening
UNIQUE (screening_id, seat_id)  -- on ticket table

-- Prevents duplicate seat codes within a screen
UNIQUE (screen_id, seat_code)   -- on seat table

-- Prevents duplicate user emails
UNIQUE (email)                  -- on user table
```

---

### Authentication — JSON Web Tokens (JWT)

| Library | Role |
|---------|------|
| `jsonwebtoken` | Sign and verify JWTs |
| `bcrypt` | Hash and compare passwords |

**JWT payload contains:**
```json
{
  "sub": "user_id",
  "role": "STUDENT | GUARD | ADMIN",
  "iat": 1234567890,
  "exp": 1234654290
}
```

**Why JWT?**
- Stateless — no session table needed
- Role is embedded; role guards can decode without a DB hit
- Access token (short-lived) + optional refresh token pattern

**Password handling:**
- `bcrypt` with cost factor 12
- Password hash is **never** returned in any API response

---

### QR Credential Signing — jsonwebtoken (server-side)

The same `jsonwebtoken` library signs the QR credential at ticket creation:

```json
{
  "ticket_id": 42,
  "screening_id": 7,
  "user_id": 15,
  "iat": 1234567890
}
```

- Signed with `QR_SECRET` environment variable (different from `JWT_SECRET`)
- Short-lived or scoped to prevent general token reuse
- Guard scanner sends the raw token to `/api/scan/validate` — server verifies signature first

---

### Validation — Zod (shared schema definitions)

- Request body validation on all POST/PATCH routes using Zod middleware
- Shared Zod schemas can be published as a shared package for frontend + backend type alignment
- Returns structured `400` errors with field-level messages

---

### Environment Configuration — dotenv

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/unipass
JWT_SECRET=<long-random-secret>
QR_SECRET=<different-long-random-secret>
PORT=3000
ADMISSION_GRACE_MINUTES=30
TZ=UTC
```

All secrets remain server-side and are never exposed to the browser.

---

## 🗃️ Data Layer Summary

| Concern | Solution |
|---------|----------|
| Relational integrity | PostgreSQL foreign keys |
| Double-booking prevention | `UNIQUE(screening_id, seat_id)` DB constraint |
| Atomic scan transition | Conditional UPDATE with row count check |
| Concurrent booking safety | DB transaction + constraint violation catch |
| Seat code uniqueness | `UNIQUE(screen_id, seat_code)` DB constraint |
| Password security | bcrypt cost 12 |
| Auth tokens | JWT, short-lived |
| QR credential | Separate signed JWT with QR_SECRET |

---

## 🧪 Development Tooling

| Tool | Purpose |
|------|---------|
| ESLint + Prettier | Code style and linting |
| TypeScript strict mode | Type safety across both ends |
| Prisma Studio | Visual DB inspector during development |
| Postman / Thunder Client | API testing |
| Git + conventional commits | Version control |

---

## 📦 Package Summary

### Backend (`backend/package.json`)

```json
{
  "dependencies": {
    "express": "^4.18",
    "@prisma/client": "^5",
    "jsonwebtoken": "^9",
    "bcrypt": "^5",
    "zod": "^3",
    "dotenv": "^16",
    "cors": "^2"
  },
  "devDependencies": {
    "prisma": "^5",
    "typescript": "^5",
    "tsx": "^4",
    "@types/express": "^4",
    "@types/jsonwebtoken": "^9",
    "@types/bcrypt": "^5"
  }
}
```

### Frontend (`frontend/package.json`)

```json
{
  "dependencies": {
    "react": "^18",
    "react-dom": "^18",
    "react-router-dom": "^6",
    "@tanstack/react-query": "^5",
    "axios": "^1",
    "zustand": "^4",
    "react-hook-form": "^7",
    "zod": "^3",
    "@hookform/resolvers": "^3",
    "qrcode.react": "^3",
    "html5-qrcode": "^2"
  },
  "devDependencies": {
    "vite": "^5",
    "@vitejs/plugin-react": "^4",
    "typescript": "^5"
  }
}
```

---

## 🔒 Security Checklist

- [x] Role authorization enforced server-side on every protected route
- [x] Passwords hashed with bcrypt, never stored plain
- [x] JWT secrets stored in environment variables only
- [x] QR signing secret separate from auth JWT secret
- [x] QR payload does not expose unnecessary personal data
- [x] Atomic conditional UPDATE prevents ticket replay attacks
- [x] DB `UNIQUE` constraint prevents concurrent double-booking
- [x] Server clock used for all time validation — never browser clock
- [x] Student cannot select GUARD or ADMIN role during registration
- [x] Guards cannot manually alter ticket state — only server transitions allowed
