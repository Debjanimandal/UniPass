// ─── Enums ───────────────────────────────────────────────────────
export type Role = 'STUDENT' | 'GUARD' | 'ADMIN';
export type SeatType = 'REGULAR' | 'PREMIUM' | 'VIP';
export type TicketStatus = 'VALID' | 'SCANNED' | 'CANCELLED';
export type SeatAvailability = 'AVAILABLE' | 'OCCUPIED';

// ─── Entities ────────────────────────────────────────────────────

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export interface Movie {
  movieId: number;
  title: string;
  description: string;
  durationMinutes: number;
  language: string;
  genre: string;
  posterUrl: string;
  isActive: boolean;
  createdAt: string;
  screenings?: Screening[];
  _count?: { screenings: number };
}

export interface Screen {
  screenId: number;
  screenName: string;
  venue: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  _count?: { seats: number };
}

export interface Seat {
  seatId: number;
  screenId: number;
  rowNo: number;
  seatNo: number;
  seatCode: string;
  seatType: SeatType;
  isActive: boolean;
  availability?: SeatAvailability;
}

export interface Screening {
  screeningId: number;
  movieId: number;
  screenId: number;
  date: string;
  startTime: string;
  endTime: string;
  price: string | number;
  isActive: boolean;
  createdAt: string;
  movie?: Movie;
  screen?: Screen;
  _count?: { tickets: number };
}

export interface Ticket {
  ticketId: number;
  userId: number;
  screeningId: number;
  seatId: number;
  status: TicketStatus;
  bookedAt: string;
  scannedAt: string | null;
  scannedBy: number | null;
  createdAt: string;
  user?: User;
  screening?: Screening;
  seat?: Seat;
  scanner?: User | null;
  qrCredential?: string;
}

// ─── API Response Shapes ──────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Auth ─────────────────────────────────────────────────────────

export interface AuthResponse {
  user: User;
  token: string;
}

// ─── Forms ────────────────────────────────────────────────────────

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}
