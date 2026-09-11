# 📋 UniPass – Implementation Plan

> This document defines the complete, phased implementation roadmap for the UniPass platform. Each phase builds on the previous. No phase should be skipped. Implementation should not begin until the database schema is finalized and migrated.

---

## 🗂️ Phase Overview

| Phase | Name | Deliverable |
|-------|------|-------------|
| **0** | Project Bootstrap | Monorepo structure, tooling, environment |
| **1** | Database Schema | Prisma schema, migrations, seed data |
| **2** | Backend Core | Auth, middleware, user management |
| **3** | Movies & Screens | Movie CRUD, Screen CRUD, Seat Layout CRUD |
| **4** | Screenings | Screening CRUD, availability endpoint |
| **5** | Booking Engine | Seat selection, ticket creation, concurrency safety |
| **6** | QR & Ticket System | QR signing, digital ticket endpoint |
| **7** | Guard Scanner | Scan endpoint, atomic validation, result API |
| **8** | Frontend Foundation | Vite app, routing, auth store, API client |
| **9** | Public Pages | Landing, Login, Register, Films, Events |
| **10** | Student Portal | Dashboard, Seat Selection, Booking, My Tickets, Digital Ticket, Profile |
| **11** | Guard Portal | Scanner UI, Validation Result |
| **12** | Admin Portal | All admin CRUD pages, scan monitoring |
| **13** | Polish & Hardening | UI states, error handling, security audit, seed data |

---

## Phase 0 — Project Bootstrap

### Goals
- Establish the folder structure for both `backend/` and `frontend/`
- Configure TypeScript for both workspaces
- Set up `.env` files with required environment variable keys
- Set up ESLint and Prettier

### Tasks

**Backend**
- [ ] `npm init` in `backend/`
- [ ] Install core deps: express, prisma, @prisma/client, jsonwebtoken, bcrypt, zod, dotenv, cors
- [ ] Install dev deps: typescript, tsx, @types/*
- [ ] Create `tsconfig.json` (strict mode, target ES2022)
- [ ] Create `src/main.ts` — Express app entry point
- [ ] Create `.env.example` with keys: `DATABASE_URL`, `JWT_SECRET`, `QR_SECRET`, `PORT`, `ADMISSION_GRACE_MINUTES`, `TZ`
- [ ] Create `src/config/env.ts` — validated environment config using Zod

**Frontend**
- [ ] Scaffold with Vite: `npm create vite@latest frontend -- --template react-ts`
- [ ] Install deps: react-router-dom, @tanstack/react-query, axios, zustand, react-hook-form, zod, @hookform/resolvers, qrcode.react, html5-qrcode
- [ ] Configure path aliases in `vite.config.ts` (`@/` → `src/`)
- [ ] Create `.env` with `VITE_API_BASE_URL`

**Shared**
- [ ] Create root `package.json` (workspaces or simple scripts)
- [ ] Add `.gitignore` (node_modules, .env, dist, build)

---

## Phase 1 — Database Schema

### Goals
- Define all six entities in `prisma/schema.prisma`
- Apply all constraints (UNIQUE, FK, enums)
- Run migration and verify schema in Prisma Studio
- Seed the database with representative test data

### Prisma Schema Outline

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  STUDENT
  GUARD
  ADMIN
}

enum SeatType {
  REGULAR
  PREMIUM
  VIP
}

enum TicketStatus {
  VALID
  SCANNED
  CANCELLED
}

model User {
  userId       Int       @id @default(autoincrement()) @map("user_id")
  firstName    String    @map("first_name")
  lastName     String    @map("last_name")
  email        String    @unique
  phone        String
  passwordHash String    @map("password_hash")
  role         Role      @default(STUDENT)
  isActive     Boolean   @default(true) @map("is_active")
  createdAt    DateTime  @default(now()) @map("created_at")

  tickets      Ticket[]  @relation("TicketBooker")
  scannedTickets Ticket[] @relation("TicketScanner")

  @@map("users")
}

model Movie {
  movieId         Int        @id @default(autoincrement()) @map("movie_id")
  title           String
  description     String
  durationMinutes Int        @map("duration_minutes")
  language        String
  genre           String
  posterUrl       String     @map("poster_url")
  isActive        Boolean    @default(true) @map("is_active")
  createdAt       DateTime   @default(now()) @map("created_at")

  screenings      Screening[]

  @@map("movies")
}

model Screen {
  screenId    Int        @id @default(autoincrement()) @map("screen_id")
  screenName  String     @map("screen_name")
  venue       String
  description String
  isActive    Boolean    @default(true) @map("is_active")
  createdAt   DateTime   @default(now()) @map("created_at")

  seats       Seat[]
  screenings  Screening[]

  @@map("screens")
}

model Seat {
  seatId    Int      @id @default(autoincrement()) @map("seat_id")
  screenId  Int      @map("screen_id")
  rowNo     Int      @map("row_no")
  seatNo    Int      @map("seat_no")
  seatCode  String   @map("seat_code")
  seatType  SeatType @default(REGULAR) @map("seat_type")
  isActive  Boolean  @default(true) @map("is_active")

  screen    Screen   @relation(fields: [screenId], references: [screenId])
  tickets   Ticket[]

  @@unique([screenId, seatCode])
  @@map("seats")
}

model Screening {
  screeningId Int      @id @default(autoincrement()) @map("screening_id")
  movieId     Int      @map("movie_id")
  screenId    Int      @map("screen_id")
  date        DateTime @db.Date
  startTime   DateTime @map("start_time") @db.Time
  endTime     DateTime @map("end_time") @db.Time
  price       Decimal  @db.Decimal(10, 2)
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")

  movie       Movie    @relation(fields: [movieId], references: [movieId])
  screen      Screen   @relation(fields: [screenId], references: [screenId])
  tickets     Ticket[]

  @@map("screenings")
}

model Ticket {
  ticketId    Int           @id @default(autoincrement()) @map("ticket_id")
  userId      Int           @map("user_id")
  screeningId Int           @map("screening_id")
  seatId      Int           @map("seat_id")
  status      TicketStatus  @default(VALID)
  bookedAt    DateTime      @default(now()) @map("booked_at")
  scannedAt   DateTime?     @map("scanned_at")
  scannedBy   Int?          @map("scanned_by")
  createdAt   DateTime      @default(now()) @map("created_at")

  user        User          @relation("TicketBooker", fields: [userId], references: [userId])
  screening   Screening     @relation(fields: [screeningId], references: [screeningId])
  seat        Seat          @relation(fields: [seatId], references: [seatId])
  scanner     User?         @relation("TicketScanner", fields: [scannedBy], references: [userId])

  @@unique([screeningId, seatId])
  @@map("tickets")
}
```

### Tasks
- [ ] Write complete `prisma/schema.prisma` as above
- [ ] Run `npx prisma migrate dev --name init`
- [ ] Verify schema in Prisma Studio (`npx prisma studio`)
- [ ] Write `prisma/seed.ts`:
  - 1 Admin user, 1 Guard user, 3 Student users
  - 5 Movies (with poster URLs)
  - 3 Screens (each with 30–50 seats in rows)
  - 8–10 Screenings across movies and screens
  - 5–10 Tickets (various statuses: VALID, SCANNED, CANCELLED)

---

## Phase 2 — Backend Core (Auth & Middleware)

### Goals
- Authentication endpoints: Register, Login, Me
- JWT middleware for protected routes
- Role-based authorization middleware
- Consistent error response shape

### File Structure
```
src/
├── config/
│   └── env.ts              # Validated env vars
├── middleware/
│   ├── auth.ts             # JWT verification middleware
│   ├── role.ts             # Role guard factory
│   └── validate.ts         # Zod request validation middleware
├── modules/
│   └── auth/
│       ├── auth.router.ts
│       ├── auth.controller.ts
│       └── auth.service.ts
└── utils/
    ├── jwt.ts              # Sign/verify auth tokens
    ├── hash.ts             # bcrypt helpers
    └── response.ts         # Consistent success/error shapes
```

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | Public | Register as STUDENT only |
| POST | `/api/auth/login` | Public | Return JWT on valid credentials |
| GET | `/api/auth/me` | STUDENT/GUARD/ADMIN | Return current user (no password) |

### Register Rules
- Role must be forced to `STUDENT` on the server — client input for role is ignored or rejected
- Email uniqueness is enforced at DB level; return a clear 409 if duplicate

### JWT Middleware Logic
```typescript
// middleware/auth.ts
// 1. Extract Bearer token from Authorization header
// 2. Verify with JWT_SECRET
// 3. Attach decoded user (id, role) to req.user
// 4. Return 401 if missing/invalid
```

### Role Guard Logic
```typescript
// middleware/role.ts
// Factory: requireRole('ADMIN') returns middleware
// Checks req.user.role against allowed roles
// Returns 403 if unauthorized
```

### Error Response Shape
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email already in use",
    "fields": { "email": "Email already in use" }
  }
}
```

### Tasks
- [ ] Implement `utils/jwt.ts` — sign/verify auth JWTs
- [ ] Implement `utils/hash.ts` — bcrypt helpers
- [ ] Implement `middleware/auth.ts` — JWT extractor + verifier
- [ ] Implement `middleware/role.ts` — role guard factory
- [ ] Implement `middleware/validate.ts` — Zod body/params validator
- [ ] Implement `modules/auth/auth.service.ts` — register, login, getMe
- [ ] Implement `modules/auth/auth.controller.ts`
- [ ] Implement `modules/auth/auth.router.ts`
- [ ] Test with Postman: register, login, me, role rejection

---

## Phase 3 — Movies, Screens & Seat Layouts

### Goals
- Full CRUD for Movies, Screens, and Seats (admin-protected)
- Public read endpoints for students to browse
- Seat layout management per screen

### API Endpoints

**Movies**

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/movies` | Public | List active movies |
| GET | `/api/movies/:id` | Public | Movie detail + upcoming screenings |
| POST | `/api/movies` | ADMIN | Create movie |
| PATCH | `/api/movies/:id` | ADMIN | Update movie |
| DELETE | `/api/movies/:id` | ADMIN | Soft-delete (set is_active=false) |

**Screens**

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/screens` | ADMIN | List all screens |
| GET | `/api/screens/:id` | ADMIN | Screen detail + seat count |
| POST | `/api/screens` | ADMIN | Create screen |
| PATCH | `/api/screens/:id` | ADMIN | Update screen |
| DELETE | `/api/screens/:id` | ADMIN | Soft-delete |

**Seats**

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/screens/:id/seats` | ADMIN | All seats for a screen |
| POST | `/api/screens/:id/seats` | ADMIN | Add seat to screen |
| PATCH | `/api/seats/:id` | ADMIN | Update seat |
| DELETE | `/api/seats/:id` | ADMIN | Soft-delete seat |
| POST | `/api/screens/:id/seats/bulk` | ADMIN | Bulk-generate seat layout |

### Tasks
- [ ] Implement Movie module (router, controller, service)
- [ ] Implement Screen module (router, controller, service)
- [ ] Implement Seat module (router, controller, service)
- [ ] Implement bulk seat generation endpoint (given rows × seats per row)
- [ ] Test all endpoints with auth and without

---

## Phase 4 — Screenings & Availability

### Goals
- Screening CRUD (admin)
- Public screening list and detail
- Seat availability calculation for a screening

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/screenings` | Public | List active screenings (with filters: movie, date) |
| GET | `/api/screenings/:id` | Public | Screening detail + movie + screen |
| GET | `/api/screenings/:id/seats` | STUDENT | Seat layout with availability for this screening |
| POST | `/api/screenings` | ADMIN | Create screening |
| PATCH | `/api/screenings/:id` | ADMIN | Update screening |
| DELETE | `/api/screenings/:id` | ADMIN | Soft-delete |

### Seat Availability Logic
```
1. Get all seats belonging to screening.screen_id where is_active = true
2. Get all ticket.seat_id for this screening_id where status != CANCELLED
3. Mark booked seat_ids as OCCUPIED
4. Return array: { seat_id, seat_code, row_no, seat_no, seat_type, status: 'AVAILABLE' | 'OCCUPIED' }
```

### Tasks
- [ ] Implement Screening module (router, controller, service)
- [ ] Implement seat availability calculation
- [ ] Test availability before and after booking

---

## Phase 5 — Booking Engine

### Goals
- Concurrency-safe seat booking
- Prevent double-booking at DB level
- Ticket creation with VALID status

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/bookings` | STUDENT | Book a seat at a screening |
| GET | `/api/bookings` | STUDENT | My bookings |
| GET | `/api/bookings/:id` | STUDENT | Single booking detail |
| PATCH | `/api/bookings/:id/cancel` | STUDENT | Cancel booking (VALID only) |
| GET | `/api/admin/bookings` | ADMIN | All bookings |

### Booking Request Body
```json
{
  "screening_id": 7,
  "seat_id": 42
}
```

### Booking Service Logic
```typescript
async function createBooking(userId, screeningId, seatId) {
  return prisma.$transaction(async (tx) => {
    // 1. Verify screening exists and is active
    const screening = await tx.screening.findFirstOrThrow({ where: { screeningId, isActive: true } });

    // 2. Verify seat belongs to screening's screen
    const seat = await tx.seat.findFirstOrThrow({
      where: { seatId, screenId: screening.screenId, isActive: true }
    });

    // 3. Attempt INSERT — DB UNIQUE(screeningId, seatId) is the final guard
    //    If duplicate, Prisma throws P2002 → return 409 SEAT_ALREADY_BOOKED
    const ticket = await tx.ticket.create({
      data: {
        userId,
        screeningId,
        seatId,
        status: 'VALID',
        bookedAt: new Date(),
      }
    });

    return ticket;
  });
}
```

### Error Handling
- `P2002` (unique constraint violation) → `409 SEAT_ALREADY_BOOKED`
- Seat not belonging to screen → `400 SEAT_SCREEN_MISMATCH`
- Screening inactive → `404 SCREENING_NOT_FOUND`

### Tasks
- [ ] Implement booking service with Prisma transaction
- [ ] Handle P2002 conflict gracefully
- [ ] Implement booking list and cancel endpoints
- [ ] Test concurrent booking with two simultaneous requests to the same seat

---

## Phase 6 — QR Credential & Digital Ticket

### Goals
- Generate signed QR credential at ticket creation
- Expose digital ticket endpoint
- QR code renders in browser via qrcode.react

### QR Credential Design

```typescript
// utils/qr.ts

const QR_SECRET = process.env.QR_SECRET!;

export function signTicketCredential(ticket: Ticket): string {
  return jwt.sign(
    {
      ticket_id: ticket.ticketId,
      screening_id: ticket.screeningId,
      user_id: ticket.userId,
    },
    QR_SECRET,
    { expiresIn: '365d' }  // long-lived; validity is checked via DB status
  );
}

export function verifyTicketCredential(token: string) {
  return jwt.verify(token, QR_SECRET) as {
    ticket_id: number;
    screening_id: number;
    user_id: number;
  };
}
```

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/tickets` | STUDENT | All my tickets |
| GET | `/api/tickets/:id` | STUDENT | Ticket detail + QR credential |

### Digital Ticket Response
```json
{
  "ticket_id": 42,
  "status": "VALID",
  "booked_at": "2026-09-10T21:00:00Z",
  "qr_credential": "eyJhbGciOiJIUzI1NiJ9...",
  "movie": { "title": "Interstellar", "poster_url": "..." },
  "screening": { "date": "2026-09-12", "start_time": "19:30", "end_time": "22:00", "screen_name": "Screen A", "venue": "Main Hall" },
  "seat": { "seat_code": "A5", "seat_type": "PREMIUM", "row_no": 1, "seat_no": 5 }
}
```

> `qr_credential` is the signed JWT — the frontend passes it to `<QRCodeSVG value={qr_credential} />`

### Tasks
- [ ] Implement `utils/qr.ts` — sign/verify QR credential
- [ ] Sign credential on ticket creation and store (or regenerate on demand)
- [ ] Implement ticket detail endpoint returning QR credential
- [ ] Test: modify QR payload manually → validation should fail in Phase 7

---

## Phase 7 — Guard Scanner & Entry Validation

### Goals
- Scan endpoint validates QR credentials server-authoritatively
- Atomic VALID → SCANNED transition using conditional UPDATE
- All failure reasons handled and returned
- Time window validation using server clock

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/scan/validate` | GUARD | Validate a scanned QR credential |
| GET | `/api/scan/history` | GUARD | Guard's own scan history |

### Scan Request
```json
{
  "credential": "eyJhbGciOiJIUzI1NiJ9..."
}
```

### Validation Logic (Sequential Checks)

```typescript
async function validateScan(credential: string, guardId: number) {

  // Step 1: Verify cryptographic signature
  let payload;
  try {
    payload = verifyTicketCredential(credential);
  } catch {
    return { success: false, reason: 'INVALID_SIGNATURE' };
  }

  // Step 2: Find ticket with screening info
  const ticket = await prisma.ticket.findUnique({
    where: { ticketId: payload.ticket_id },
    include: { screening: true }
  });
  if (!ticket) return { success: false, reason: 'TICKET_NOT_FOUND' };

  // Step 3: Check status
  if (ticket.status === 'SCANNED')   return { success: false, reason: 'ALREADY_USED' };
  if (ticket.status === 'CANCELLED') return { success: false, reason: 'CANCELLED' };

  // Step 4: Check date (server clock)
  const serverNow = new Date();
  const screeningDate = ticket.screening.date;
  if (!isSameDate(serverNow, screeningDate)) return { success: false, reason: 'INVALID_DATE' };

  // Step 5: Check time window (server clock)
  const gracePeriod = parseInt(process.env.ADMISSION_GRACE_MINUTES ?? '30');
  const admissionOpen = subMinutes(screeningStartTime, gracePeriod);
  const admissionClose = screeningEndTime;
  if (serverNow < admissionOpen || serverNow > admissionClose) {
    return { success: false, reason: 'INVALID_TIME_SLOT' };
  }

  // Step 6: Atomic conditional UPDATE
  const result = await prisma.ticket.updateMany({
    where: { ticketId: ticket.ticketId, status: 'VALID' },
    data: {
      status: 'SCANNED',
      scannedAt: serverNow,
      scannedBy: guardId,
    }
  });

  if (result.count === 0) {
    // Another concurrent request already scanned it
    return { success: false, reason: 'ALREADY_USED' };
  }

  return { success: true, ticket_id: ticket.ticketId };
}
```

### Scan Response (Success)
```json
{
  "success": true,
  "result": "ENTRY_ALLOWED",
  "data": {
    "student_name": "Jane Smith",
    "movie_title": "Interstellar",
    "seat_code": "A5",
    "screening_date": "2026-09-12",
    "start_time": "19:30"
  }
}
```

### Scan Response (Failure)
```json
{
  "success": false,
  "result": "ALREADY_USED",
  "message": "This ticket has already been scanned.",
  "scanned_at": "2026-09-12T19:35:22Z"
}
```

### Tasks
- [ ] Implement `utils/qr.ts` verify function
- [ ] Implement scan service with all six check steps
- [ ] Implement atomic conditional UPDATE
- [ ] Implement scan history endpoint
- [ ] Test replay attack: scan same ticket twice simultaneously
- [ ] Test tampered QR payload
- [ ] Test outside time window
- [ ] Test cancelled ticket

---

## Phase 8 — Frontend Foundation

### Goals
- Vite React app with routing, auth store, API client
- Protected route components per role
- Global loading and error states

### Core Setup

**Auth Store (Zustand)**
```typescript
// store/auth.store.ts
interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}
```

**API Client (Axios)**
```typescript
// services/api.client.ts
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(null, (error) => {
  if (error.response?.status === 401) {
    useAuthStore.getState().logout();
    window.location.href = '/login';
  }
  return Promise.reject(error);
});
```

**Route Structure**
```
/                           → Landing
/login                      → Login
/register                   → Register
/films                      → Films (public)
/events                     → Events (public)

/student/dashboard          → Student Dashboard
/student/films              → Student Films
/student/events             → Student Events
/student/movies/:id         → Movie Detail
/student/screenings/:id     → Screening Detail
/student/screenings/:id/book → Seat Selection
/student/booking-confirmation → Booking Confirmation
/student/bookings           → My Bookings
/student/tickets            → My Tickets
/student/tickets/:id        → Digital Ticket
/student/profile            → Profile

/guard/scan                 → QR Scanner
/guard/history              → Scan History

/admin/dashboard            → Admin Dashboard
/admin/movies               → Movies CRUD
/admin/screens              → Screens CRUD
/admin/seats                → Seat Layout Management
/admin/screenings           → Screenings CRUD
/admin/users                → Users CRUD
/admin/bookings             → All Bookings
/admin/scans                → Entry Monitoring
```

**Protected Route Components**
```typescript
// components/routes/StudentRoute.tsx — redirects non-STUDENT
// components/routes/GuardRoute.tsx   — redirects non-GUARD
// components/routes/AdminRoute.tsx   — redirects non-ADMIN
```

### Tasks
- [ ] Set up Vite + React + TypeScript
- [ ] Configure React Router with full route tree
- [ ] Implement Zustand auth store with localStorage persistence
- [ ] Implement Axios client with interceptors
- [ ] Create ProtectedRoute components for each role
- [ ] Create global CSS design system (tokens, typography, base styles)
- [ ] Create reusable components: NavBar, Sidebar, Button, Card, Badge, LoadingSpinner, ErrorMessage, EmptyState

---

## Phase 9 — Public Pages

### Pages
1. **Landing / Home** — hero, value proposition, featured movies carousel, CTA
2. **Login** — email/password form, error states, redirect on success
3. **Register** — first name, last name, email, phone, password; STUDENT role only
4. **Films (Public)** — movie cards with poster, title, genre, duration, language, screening count
5. **Events (Public)** — screening cards with movie name, date, time, screen, venue, price, availability

### Design Rules for All Pages
- White/light background
- Blue (`#1a56db` range) for primary actions and accents
- Inter font for body, Outfit for headings
- Card grid layout with consistent shadow and border-radius
- Navbar with active state (white text on blue)

### Tasks
- [ ] Implement Landing page with hero section and feature grid
- [ ] Implement Login page and form with React Hook Form + Zod
- [ ] Implement Register page and form with role forced to STUDENT
- [ ] Implement Films page with movie cards grid
- [ ] Implement Events page with screening cards
- [ ] Connect all pages to backend via React Query hooks

---

## Phase 10 — Student Portal

### Pages & Key Features

**Dashboard**
- Welcome message with student's first name
- Upcoming tickets (next 3)
- Recent bookings (last 5)
- Quick-access buttons: Browse Films, Browse Events, My Tickets

**Films**
- Same as public but inside student nav shell
- Each card links to Movie Detail

**Movie Detail**
- Full poster, title, description, duration, language, genre
- List of upcoming screenings (date, time, screen, venue, price, availability)
- Each screening has a "Book Now" button

**Seat Selection & Booking** (most complex page)
- Header: Movie title, Screening date/time, Screen name, Venue, Price per seat
- Visual seat map:
  - CSS Grid based on row_no and seat_no
  - States: available (clickable), occupied (disabled), selected (highlighted)
  - Seat type color-coding (REGULAR, PREMIUM, VIP)
  - Legend
- Booking summary panel:
  - Selected seat code and type
  - Screening details
  - Total price
  - Confirm Booking button (disabled until seat selected)
- On confirm: POST `/api/bookings` → redirect to Booking Confirmation

**Booking Confirmation**
- Success animation
- Booking summary (movie, screening, seat, price)
- Buttons: View Ticket, My Bookings

**My Bookings**
- Table/card list of all bookings
- Status badges (VALID, SCANNED, CANCELLED)
- Link to Digital Ticket

**My Tickets**
- Card view of all tickets with status
- Each card: movie poster, title, date, seat, status badge

**Digital Ticket**
- Large QR code (from qrcode.react, value = qr_credential)
- Human-readable info below: movie, date, time, screen, venue, seat, status
- **Do not show raw JWT string**

**Profile**
- Display: first name, last name, email, phone, role
- Edit: first name, last name, phone

### Tasks
- [ ] Implement all student pages listed above
- [ ] Implement seat map component with CSS Grid
- [ ] Implement booking flow with React Query mutation
- [ ] Implement Digital Ticket with QR display
- [ ] Implement React Query hooks for all student data fetching

---

## Phase 11 — Guard Portal

### Pages

**QR Scanner**
- `html5-qrcode` camera interface
- On successful QR decode → POST `/api/scan/validate`
- Show loading state during validation
- Immediately display result
- Automatically ready for next scan after result display

**Validation Result Display**
- ✅ Success state: green card, student name, movie, seat, date
- ❌ Failure state: red card, reason code, human-readable explanation

**Scan History** (optional)
- List of scans performed by this guard (from `/api/scan/history`)

### Tasks
- [ ] Implement QR scanner with html5-qrcode
- [ ] Implement scan mutation hook (POST to validate)
- [ ] Implement success/failure result display
- [ ] Implement auto-reset after 3 seconds for next scan
- [ ] Implement scan history page

---

## Phase 12 — Admin Portal

### Pages

**Admin Dashboard**
- Stats: total movies, active screenings, total tickets, tickets scanned today
- Quick navigation cards

**Movies Management**
- Paginated table with: title, genre, duration, language, active status, actions
- Create/Edit modal/form: title, description, duration, language, genre, poster URL, is_active
- Soft-delete (set is_active = false)

**Screens Management**
- Table: screen name, venue, seat count, active status, actions
- Create/Edit form: screen name, venue, description, is_active

**Seat Layout Management**
- Select a screen → view its seat layout as a visual grid
- Add individual seat: row no, seat no, seat code, seat type
- Bulk generate: rows × seats per row, seat type distribution
- Edit/deactivate individual seats

**Screenings Management**
- Table: movie, screen, date, start time, end time, price, ticket count, active
- Create/Edit form: movie select, screen select, date picker, time pickers, price, is_active

**Users Management**
- Table: name, email, role, active status, created at
- Create user: all fields including role (STUDENT/GUARD/ADMIN)
- Edit user: update details, toggle is_active
- Reset password

**All Bookings**
- Table: ticket ID, student, movie, screening, seat, status, booked at
- Filter by screening, movie, status
- Admin can cancel a ticket

**Entry / Scan Monitoring**
- Table: ticket ID, student, movie, seat, scanned at, scanned by (guard name)
- Filter by date, guard

### Tasks
- [ ] Implement Admin layout with sidebar navigation
- [ ] Implement all admin pages listed above
- [ ] Implement shared AdminTable, AdminForm, AdminModal components
- [ ] Connect all pages to admin API endpoints
- [ ] Implement seat layout visual editor

---

## Phase 13 — Polish, Hardening & Verification

### UI Polish
- [ ] All loading states (skeleton cards or spinner)
- [ ] All empty states (no movies, no bookings, etc.)
- [ ] All error states (network error, 404, 403 pages)
- [ ] Responsive layout testing (desktop, tablet, mobile)
- [ ] Active nav state on all pages
- [ ] Consistent font sizes, spacing, colors across all pages

### Security Audit
- [ ] Confirm no password hashes in any API response
- [ ] Confirm role checks on every protected backend route
- [ ] Confirm QR_SECRET is separate from JWT_SECRET
- [ ] Confirm atomic UPDATE prevents double-scan
- [ ] Confirm DB UNIQUE constraint prevents double-booking
- [ ] Confirm server time is used for all time checks
- [ ] Confirm STUDENT cannot register with GUARD or ADMIN role

### Functional Verification
- [ ] End-to-end booking flow: login → browse → select seat → confirm → view QR
- [ ] Guard scan flow: login → scan valid ticket → ENTRY ALLOWED
- [ ] Guard replay: scan same ticket again → ALREADY_USED
- [ ] Guard scan: tampered QR → INVALID_SIGNATURE
- [ ] Guard scan: cancelled ticket → CANCELLED
- [ ] Admin creates movie, screen, seats, screening → student sees and books

### Seed Data for Testing
- [ ] Ensure seed includes all ticket statuses (VALID, SCANNED, CANCELLED)
- [ ] Ensure seed has upcoming screenings (future dates from current time)
- [ ] Ensure seed has fully-occupied screening (all seats booked) for sold-out display

---

## 🧩 Reusable Component Inventory

| Component | Used In |
|-----------|---------|
| `MovieCard` | Films, Dashboard |
| `ScreeningCard` | Events, Movie Detail |
| `SeatMap` | Seat Selection |
| `SeatButton` | Seat Map |
| `TicketCard` | My Tickets, My Bookings |
| `QRDisplay` | Digital Ticket |
| `StatusBadge` | Tickets, Bookings, Admin tables |
| `NavBar` | Public pages |
| `StudentSidebar` | Student portal |
| `GuardLayout` | Guard portal |
| `AdminSidebar` | Admin portal |
| `DashboardStatCard` | Admin + Student dashboard |
| `LoadingSpinner` | All async states |
| `EmptyState` | Empty lists |
| `ErrorMessage` | Form and API errors |
| `ConfirmDialog` | Cancel booking, delete actions |
| `AdminTable` | All admin list pages |
| `AdminFormModal` | All admin create/edit forms |
| `ScanResultCard` | Guard scan result |

---

## ⚠️ Implementation Constraints (Never Violate)

- Do **not** combine MOVIE and SCREENING into one table
- Do **not** duplicate movie fields inside screening rows
- Do **not** create a new SEAT layout per screening — reuse SCREEN's seats
- Do **not** perform ticket state transitions in the frontend — server only
- Do **not** use browser clock for time validation — server clock only
- Do **not** allow STUDENT to register as GUARD or ADMIN
- Do **not** allow the QR payload to expose password, secrets, or be decoded into sensitive data
- Do **not** skip the DB `UNIQUE` constraints — they are the final concurrency guard
- Do **not** create unnecessary persistent entities for JWT, QRCode, or AuthToken

---

## 📅 Recommended Build Order

```
Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
   ↓
Phase 6 → Phase 7 (backend complete)
   ↓
Phase 8 → Phase 9 → Phase 10 → Phase 11 → Phase 12 → Phase 13
```

Backend (Phases 0–7) should be complete and tested before heavy frontend work begins. The database schema (Phase 1) must never change after Phase 5 without a planned migration.
