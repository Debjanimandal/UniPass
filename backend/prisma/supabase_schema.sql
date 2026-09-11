-- ═══════════════════════════════════════════════════════════════════════════
-- UniPass Database Schema for Supabase (PostgreSQL)
-- 
-- Cardinalities:
--   USER      1:N  TICKET   (via user_id    — student books many tickets)
--   USER      1:N  TICKET   (via scanned_by — guard scans many tickets)   ← 1:N, NOT 1:1
--   MOVIE     1:N  SCREENING
--   SCREEN    1:N  SCREENING
--   SCREEN    1:N  SEAT
--   SCREENING 1:N  TICKET
--   SEAT      1:N  TICKET   (same seat, different screenings)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 0. Clean slate (run only in development) ────────────────────────────────
-- DROP TABLE IF EXISTS tickets   CASCADE;
-- DROP TABLE IF EXISTS seats     CASCADE;
-- DROP TABLE IF EXISTS screenings CASCADE;
-- DROP TABLE IF EXISTS screens   CASCADE;
-- DROP TABLE IF EXISTS movies    CASCADE;
-- DROP TABLE IF EXISTS users     CASCADE;
-- DROP TYPE IF EXISTS user_role;
-- DROP TYPE IF EXISTS seat_type_enum;
-- DROP TYPE IF EXISTS ticket_status;

-- ─── 1. ENUM Types ───────────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('STUDENT', 'GUARD', 'ADMIN');

CREATE TYPE seat_type_enum AS ENUM ('REGULAR', 'PREMIUM', 'VIP');

CREATE TYPE ticket_status AS ENUM ('VALID', 'SCANNED', 'CANCELLED');

-- ─── 2. USER ─────────────────────────────────────────────────────────────────
-- Stores all platform users: students, guards, and admins.
-- The `role` column distinguishes them — no separate GUARD table needed.
-- One guard (USER where role='GUARD') can scan MANY tickets → 1:N via scanned_by.

CREATE TABLE users (
    user_id       SERIAL          PRIMARY KEY,
    first_name    VARCHAR(200)    NOT NULL,
    last_name     VARCHAR(200)    NOT NULL,
    email         VARCHAR(255)    NOT NULL UNIQUE,
    phone         VARCHAR(20)     NOT NULL,
    password_hash VARCHAR(255)    NOT NULL,
    role          user_role       NOT NULL DEFAULT 'STUDENT',
    is_active     BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  users              IS 'All platform users: students, guards, and admins identified by role field.';
COMMENT ON COLUMN users.role         IS 'STUDENT = can book; GUARD = can scan tickets; ADMIN = full access.';
COMMENT ON COLUMN users.password_hash IS 'bcrypt hash — never expose in API responses.';

-- ─── 3. MOVIE ────────────────────────────────────────────────────────────────
-- The reusable movie record. Created once, referenced by many screenings.
-- Do NOT duplicate movie info inside screening rows.

CREATE TABLE movies (
    movie_id         SERIAL          PRIMARY KEY,
    title            VARCHAR(500)    NOT NULL,
    description      VARCHAR(1000)   NOT NULL,
    duration_minutes INT             NOT NULL CHECK (duration_minutes > 0),
    language         VARCHAR(100)    NOT NULL,
    genre            VARCHAR(100)    NOT NULL,
    poster_url       VARCHAR(500)    NOT NULL,
    is_active        BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE movies IS 'Reusable movie records. One movie can have many screenings.';

-- ─── 4. SCREEN ───────────────────────────────────────────────────────────────
-- A physical auditorium or screening room.
-- Owns a reusable seat layout (SEAT table).
-- Hosts many screenings over time.

CREATE TABLE screens (
    screen_id   SERIAL        PRIMARY KEY,
    screen_name VARCHAR(200)  NOT NULL,
    venue       VARCHAR(200)  NOT NULL,
    description VARCHAR(500)  NOT NULL,
    is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE screens IS 'Physical auditoriums. Each screen has a reusable seat layout.';

-- ─── 5. SEAT ─────────────────────────────────────────────────────────────────
-- A physical seat permanently belonging to one screen.
-- The layout is reusable across ALL screenings on that screen.
-- 
-- Relationship: SCREEN 1:N SEAT
-- Constraint:   seat_code is UNIQUE within a screen (e.g. "A5" on Screen 1 ≠ "A5" on Screen 2)

CREATE TABLE seats (
    seat_id   SERIAL           PRIMARY KEY,
    screen_id INT              NOT NULL REFERENCES screens(screen_id) ON DELETE CASCADE,
    row_no    INT              NOT NULL CHECK (row_no > 0),
    seat_no   INT              NOT NULL CHECK (seat_no > 0),
    seat_code VARCHAR(20)      NOT NULL,
    seat_type seat_type_enum   NOT NULL DEFAULT 'REGULAR',
    is_active BOOLEAN          NOT NULL DEFAULT TRUE,

    -- A seat code must be unique within its screen (e.g. "A5" is unique per screen)
    CONSTRAINT uq_screen_seat_code UNIQUE (screen_id, seat_code)
);

COMMENT ON TABLE  seats           IS 'Physical seats owned by a screen. Layout is shared across all screenings.';
COMMENT ON COLUMN seats.seat_code IS 'Human-readable code e.g. A5. Unique per screen.';
COMMENT ON COLUMN seats.seat_type IS 'REGULAR | PREMIUM | VIP — determines pricing tier.';

-- ─── 6. SCREENING ────────────────────────────────────────────────────────────
-- A specific showing of a movie at a screen on a date/time.
-- Bridges MOVIE and SCREEN.
--
-- Relationships:
--   MOVIE  1:N SCREENING  (movie_id FK)
--   SCREEN 1:N SCREENING  (screen_id FK)

CREATE TABLE screenings (
    screening_id SERIAL          PRIMARY KEY,
    movie_id     INT             NOT NULL REFERENCES movies(movie_id)  ON DELETE RESTRICT,
    screen_id    INT             NOT NULL REFERENCES screens(screen_id) ON DELETE RESTRICT,
    date         DATE            NOT NULL,
    start_time   TIME            NOT NULL,
    end_time     TIME            NOT NULL,
    price        NUMERIC(10, 2)  NOT NULL CHECK (price >= 0),
    is_active    BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_screening_times CHECK (end_time > start_time)
);

COMMENT ON TABLE  screenings      IS 'A specific showing of a movie at a screen. Bridges MOVIE and SCREEN.';
COMMENT ON COLUMN screenings.price IS 'Ticket price for this specific screening in the platform currency.';

-- ─── 7. TICKET ───────────────────────────────────────────────────────────────
-- A student's reservation for a specific seat at a specific screening.
-- Central joining entity: USER + SCREENING + SEAT = TICKET
--
-- Relationships:
--   USER      1:N TICKET  via user_id    (student books many tickets)
--   USER      1:N TICKET  via scanned_by (ONE GUARD CAN SCAN MANY TICKETS — 1:N, not 1:1)
--   SCREENING 1:N TICKET
--   SEAT      1:N TICKET  (same seat can appear in tickets for different screenings)
--
-- Critical constraint:
--   UNIQUE(screening_id, seat_id) — same seat cannot be booked TWICE for the same screening.
--   Same seat CAN be booked for a DIFFERENT screening.
--
-- scanned_by is NULLABLE → NULL until a guard scans the ticket.
-- No UNIQUE on scanned_by → one guard can scan MANY tickets (1:N, not 1:1).

CREATE TABLE tickets (
    ticket_id    SERIAL          PRIMARY KEY,
    user_id      INT             NOT NULL REFERENCES users(user_id)     ON DELETE RESTRICT,
    screening_id INT             NOT NULL REFERENCES screenings(screening_id) ON DELETE RESTRICT,
    seat_id      INT             NOT NULL REFERENCES seats(seat_id)     ON DELETE RESTRICT,
    scanned_by   INT             NULL     REFERENCES users(user_id)     ON DELETE SET NULL,
    status       ticket_status   NOT NULL DEFAULT 'VALID',
    booked_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    scanned_at   TIMESTAMPTZ     NULL,
    created_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- Prevents double-booking the same seat for the same screening.
    -- Same seat + different screening = allowed.
    -- Same seat + same screening      = NOT allowed.
    CONSTRAINT uq_screening_seat UNIQUE (screening_id, seat_id),

    -- scanned_at must be set together with scanned_by (both null or both set)
    CONSTRAINT chk_scan_consistency CHECK (
        (scanned_at IS NULL AND scanned_by IS NULL) OR
        (scanned_at IS NOT NULL AND scanned_by IS NOT NULL)
    ),

    -- A ticket can only be scanned if it is in SCANNED status
    CONSTRAINT chk_scanned_status CHECK (
        status != 'SCANNED' OR (scanned_at IS NOT NULL AND scanned_by IS NOT NULL)
    )
);

COMMENT ON TABLE  tickets            IS 'Student reservations. Central join: USER + SCREENING + SEAT.';
COMMENT ON COLUMN tickets.user_id    IS 'The student who booked the ticket.';
COMMENT ON COLUMN tickets.scanned_by IS 'The GUARD who scanned this ticket. NULL until scanned. One guard can scan MANY tickets (1:N).';
COMMENT ON COLUMN tickets.scanned_at IS 'Server timestamp of successful scan. NULL until scanned.';
COMMENT ON COLUMN tickets.status     IS 'VALID = not yet used | SCANNED = entry granted | CANCELLED = voided.';

-- ═══════════════════════════════════════════════════════════════════════════
-- INDEXES — for query performance
-- ═══════════════════════════════════════════════════════════════════════════

-- Users: role lookup (e.g. find all GUARDs)
CREATE INDEX idx_users_role       ON users(role);
CREATE INDEX idx_users_email      ON users(email);

-- Seats: lookup all seats for a screen
CREATE INDEX idx_seats_screen_id  ON seats(screen_id);

-- Screenings: filter by movie or screen
CREATE INDEX idx_screenings_movie_id  ON screenings(movie_id);
CREATE INDEX idx_screenings_screen_id ON screenings(screen_id);
CREATE INDEX idx_screenings_date      ON screenings(date);

-- Tickets: the most query-heavy table
CREATE INDEX idx_tickets_user_id      ON tickets(user_id);          -- my bookings
CREATE INDEX idx_tickets_screening_id ON tickets(screening_id);     -- occupied seats
CREATE INDEX idx_tickets_seat_id      ON tickets(seat_id);          -- seat history
CREATE INDEX idx_tickets_scanned_by   ON tickets(scanned_by);       -- guard's scan history (1:N)
CREATE INDEX idx_tickets_status       ON tickets(status);           -- filter by VALID/SCANNED/CANCELLED

-- ═══════════════════════════════════════════════════════════════════════════
-- RELATIONSHIP SUMMARY
--
--  TABLE     | COLUMN      | REFERENCES      | CARDINALITY
-- -----------+-------------+-----------------+---------------------------
--  screenings | movie_id    | movies.movie_id  | MOVIE     1:N SCREENING
--  screenings | screen_id   | screens.screen_id| SCREEN    1:N SCREENING
--  seats      | screen_id   | screens.screen_id| SCREEN    1:N SEAT
--  tickets    | user_id     | users.user_id    | USER      1:N TICKET (booker)
--  tickets    | screening_id| screenings       | SCREENING 1:N TICKET
--  tickets    | seat_id     | seats.seat_id    | SEAT      1:N TICKET
--  tickets    | scanned_by  | users.user_id    | USER(GUARD) 1:N TICKET ← ONE GUARD, MANY TICKETS
--
-- ═══════════════════════════════════════════════════════════════════════════
