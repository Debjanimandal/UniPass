# 🎓 UniPass – Smart Event Booking & Secure Entry Platform

> A university-scale platform where students discover campus films and events, reserve seats, receive secure digital QR tickets, and gain venue entry through guard-scanned cryptographic validation.

---

## 📌 Overview

UniPass is a full-stack university event and film-booking platform built to manage the complete lifecycle of a campus screening event — from movie discovery through seat reservation, digital ticket issuance, and cryptographically secured venue entry.

The platform supports three distinct roles:

| Role | Description |
|------|-------------|
| 🎓 **STUDENT** | Discovers films, books seats, receives digital QR tickets |
| 🛡️ **GUARD** | Scans QR codes at venue entry points, receives server-validated results |
| ⚙️ **ADMIN** | Manages movies, screens, seat layouts, screenings, users, and bookings |

---

## 🎯 Core Product Flow

```
Student logs in
  └─▶ Browses Films or Events
        └─▶ Selects a Movie
              └─▶ Views available Screenings
                    └─▶ Selects a Screening
                          └─▶ Sees Screen + Seat Layout
                                └─▶ Selects an available Seat
                                      └─▶ Reviews Booking Summary
                                            └─▶ Confirms Booking
                                                  └─▶ Ticket Created (VALID)
                                                        └─▶ Signed QR Credential Generated
                                                              └─▶ Student presents Digital Ticket
                                                                    └─▶ Guard scans QR
                                                                          └─▶ Server validates → SCANNED
                                                                                └─▶ Entry Allowed ✅
```

---

## 🗄️ Database Entities

UniPass is built on **six core entities** with strict foreign-key relationships:

### USER
Stores all platform users (students, guards, admins).

| Field | Type | Notes |
|-------|------|-------|
| `user_id` | PK | |
| `first_name` | string | |
| `last_name` | string | |
| `email` | string | UNIQUE |
| `phone` | string | |
| `password_hash` | string | Never exposed |
| `role` | enum | STUDENT, GUARD, ADMIN |
| `is_active` | boolean | |
| `created_at` | datetime | |

### MOVIE
The reusable movie record — created once, referenced by many screenings.

| Field | Type | Notes |
|-------|------|-------|
| `movie_id` | PK | |
| `title` | string | |
| `description` | text | |
| `duration_minutes` | int | |
| `language` | string | |
| `genre` | string | |
| `poster_url` | string | |
| `is_active` | boolean | |
| `created_at` | datetime | |

### SCREEN
A physical auditorium or screening room on campus.

| Field | Type | Notes |
|-------|------|-------|
| `screen_id` | PK | |
| `screen_name` | string | |
| `venue` | string | |
| `description` | text | |
| `is_active` | boolean | |
| `created_at` | datetime | |

### SEAT
A physical seat permanently belonging to one screen.

| Field | Type | Notes |
|-------|------|-------|
| `seat_id` | PK | |
| `screen_id` | FK → SCREEN | |
| `row_no` | int | |
| `seat_no` | int | |
| `seat_code` | string | UNIQUE within screen |
| `seat_type` | enum | REGULAR, PREMIUM, VIP |
| `is_active` | boolean | |

> **Constraint:** `UNIQUE(screen_id, seat_code)` — seat codes are unique per screen.

### SCREENING
A specific showing of a movie at a screen on a given date and time.

| Field | Type | Notes |
|-------|------|-------|
| `screening_id` | PK | |
| `movie_id` | FK → MOVIE | |
| `screen_id` | FK → SCREEN | |
| `date` | date | |
| `start_time` | time | |
| `end_time` | time | |
| `price` | decimal | Ticket price |
| `is_active` | boolean | |
| `created_at` | datetime | |

### TICKET
A student's reservation for a specific seat at a specific screening.

| Field | Type | Notes |
|-------|------|-------|
| `ticket_id` | PK | |
| `user_id` | FK → USER | The booking student |
| `screening_id` | FK → SCREENING | |
| `seat_id` | FK → SEAT | |
| `status` | enum | VALID, SCANNED, CANCELLED |
| `booked_at` | datetime | |
| `scanned_at` | datetime | NULL until scanned |
| `scanned_by` | FK → USER (nullable) | Guard who scanned |
| `created_at` | datetime | |

> **Constraint:** `UNIQUE(screening_id, seat_id)` — prevents double-booking a seat for the same screening.

---

## 🔗 Entity Relationships

```
USER          ──1:N──▶  TICKET (as booker via user_id)
USER          ──0:N──▶  TICKET (as scanner via scanned_by)

MOVIE         ──1:N──▶  SCREENING
SCREEN        ──1:N──▶  SCREENING
SCREEN        ──1:N──▶  SEAT

SCREENING     ──1:N──▶  TICKET
SEAT          ──1:N──▶  TICKET (across different screenings)

TICKET (joins): USER + SCREENING + SEAT
```

---

## 🔐 Security Model

### QR Credential
- Server generates a **cryptographically signed credential** (JWT or HMAC-signed token) at ticket creation
- The signing secret **never leaves the server**
- The QR code encodes only the signed token — no raw personal data
- Any tampering with the payload causes signature verification failure

### Atomic Scan (Anti-Replay)
```sql
UPDATE ticket
SET status = 'SCANNED', scanned_at = NOW(), scanned_by = :guard_id
WHERE ticket_id = :id AND status = 'VALID'
```
Only one concurrent request can win this transition. A second request receives `ALREADY_USED`.

### Seat Booking Concurrency
- Database `UNIQUE(screening_id, seat_id)` is the final guard
- Backend validates availability within a transaction before INSERT
- Frontend seat availability is **advisory only**

### Time Validation
- All time checks use **server clock only**
- Configurable admission grace period (e.g. 15–30 min before start through screening end)
- Consistent timezone strategy across all timestamps

---

## 🚦 Guard Scan — Possible Outcomes

| Result | Reason |
|--------|--------|
| ✅ ENTRY ALLOWED | Ticket valid, time window correct, transition succeeded |
| ❌ INVALID_SIGNATURE | QR payload has been tampered |
| ❌ TICKET_NOT_FOUND | Ticket does not exist |
| ❌ ALREADY_USED | Ticket already scanned |
| ❌ CANCELLED | Ticket was cancelled |
| ❌ INVALID_DATE | Wrong screening date |
| ❌ INVALID_TIME_SLOT | Outside admission window |

---

## 📱 Page Inventory

### Public Pages
- **Landing / Home** — value proposition, discovery
- **Login** — email + password authentication
- **Register** — student self-registration (STUDENT role only)

### Student Pages (authenticated)
- **Dashboard** — welcome, upcoming screenings, recent bookings, quick links
- **Films** — movie-focused browse (poster, title, genre, duration, language)
- **Events / Screenings** — screening-focused browse (movie, date, time, screen, price, availability)
- **Movie Details** — full movie info + available screenings
- **Screening Details** — specific showing details
- **Seat Selection & Booking** — visual seat map, booking summary, confirm
- **Booking Confirmation** — success state post-booking
- **My Bookings** — booking history
- **My Tickets** — all tickets with status
- **Digital Ticket** — QR code + human-readable event info
- **Profile** — view/edit account details

### Guard Pages (authenticated, role-protected)
- **QR Scanner** — camera-based scan interface
- **Validation Result** — clear success/failure with reason
- **Scan History** (optional) — log of scanned tickets

### Admin Pages (authenticated, role-protected)
- **Dashboard** — platform-wide stats
- **Movies** — CRUD movie management
- **Screens** — CRUD screen management
- **Seat Layouts** — seat management per screen
- **Screenings** — schedule movies to screens
- **Users** — manage all users and roles
- **Bookings** — view and manage all bookings
- **Entry / Scan Monitoring** — audit scan events

---

## 🎨 Design Identity

- **Theme**: Clean white/light base with restrained blue accents
- **Typography**: Professional (Inter / Outfit from Google Fonts)
- **Components**: Polished cards, subtle shadows, consistent spacing
- **Feel**: Real production university web application — not a generic template
- **States**: Loading, success, error, empty, occupied, selected, scanned, cancelled, sold-out

---

## 🏛️ Auditability

Every ticket record can answer:
- **Who** booked it? (`user_id`)
- **What** movie/screening? (`screening_id` → `movie_id`)
- **Which** seat? (`seat_id`)
- **Was** it scanned? (`status`)
- **When** was it scanned? (`scanned_at`)
- **Which guard** scanned it? (`scanned_by`)

---

## 📁 Project Structure

```
UniPass/
├── README.md
├── TECHSTACK.md
├── IMPLEMENTATION.md
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── movies/
│   │   │   ├── screens/
│   │   │   ├── seats/
│   │   │   ├── screenings/
│   │   │   └── tickets/
│   │   ├── utils/
│   │   └── main.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── hooks/
    │   ├── services/
    │   ├── store/
    │   └── styles/
    └── package.json
```

---

## ⚙️ Getting Started

> See [TECHSTACK.md](./TECHSTACK.md) for the full technology rationale and [IMPLEMENTATION.md](./IMPLEMENTATION.md) for the phased build plan.

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- npm or pnpm

### Quick Start

```bash
# Clone the repository
git clone <repo-url>
cd UniPass

# Backend
cd backend
cp .env.example .env        # fill in DB_URL, JWT_SECRET, etc.
npm install
npx prisma migrate dev
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

---

## 📄 License

University project — internal use only.
