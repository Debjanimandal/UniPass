import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../store/auth.store';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor — Attach Bearer Token ────────────────────

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor — Handle Auth Errors Globally ──────────

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    // Expired / invalid token — force a clean re-login
    if (status === 401) {
      useAuthStore.getState().logout();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// ─── Auth API ─────────────────────────────────────────────────────

export const authApi = {
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) => api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  me: () => api.get('/auth/me'),

  updateProfile: (data: Partial<{ firstName: string; lastName: string; phone: string }>) =>
    api.patch('/auth/me', data),
};

// ─── Dashboard API (admin) ─────────────────────────────────────────

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
};

// ─── Users API (admin) ─────────────────────────────────────────────

export const usersApi = {
  getAll: () => api.get('/users'),

  getById: (id: number) => api.get(`/users/${id}`),

  create: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    role: 'STUDENT' | 'GUARD' | 'ADMIN';
  }) => api.post('/users', data),

  update: (
    id: number,
    data: Partial<{
      firstName: string;
      lastName: string;
      phone: string;
      role: 'STUDENT' | 'GUARD' | 'ADMIN';
      isActive: boolean;
    }>
  ) => api.patch(`/users/${id}`, data),
};

// ─── Movies API ───────────────────────────────────────────────────

export const moviesApi = {
  getAll: (params?: { active?: boolean; search?: string; category?: string; language?: string; date?: string }) =>
    api.get('/movies', { params }),

  getById: (id: number) => api.get(`/movies/${id}`),

  create: (data: {
    title: string;
    description: string;
    durationMinutes: number;
    language: string;
    genre: string;
    posterUrl: string;
    isActive?: boolean;
  }) => api.post('/movies', data),

  update: (id: number, data: Partial<{
    title: string;
    description: string;
    durationMinutes: number;
    language: string;
    genre: string;
    posterUrl: string;
    isActive: boolean;
  }>) => api.patch(`/movies/${id}`, data),

  delete: (id: number) => api.delete(`/movies/${id}`),
};


// ─── Screenings API ───────────────────────────────────────────────

export const screeningsApi = {
  getAll: (params?: { active?: boolean; movieId?: number; screenId?: number; date?: string }) =>
    api.get('/screenings', { params }),

  getById: (id: number) => api.get(`/screenings/${id}`),

  getSeats: (id: number) => api.get(`/screenings/${id}/seats`),

  create: (data: {
    movieId: number;
    screenId: number;
    date: string;
    startTime: string;
    endTime: string;
    price: number;
    isActive: boolean;
  }) => api.post('/screenings', data),

  createBulk: (data: {
    movieId: number;
    screenId: number;
    startDate: string;
    endDate: string;
    timings: { startTime: string; endTime: string }[];
    price: number;
    isActive: boolean;
  }) => api.post('/screenings/bulk', data),

  update: (
    id: number,
    data: Partial<{
      movieId: number;
      screenId: number;
      date: string;
      startTime: string;
      endTime: string;
      price: number;
      isActive: boolean;
    }>
  ) => api.patch(`/screenings/${id}`, data),

  delete: (id: number) => api.delete(`/screenings/${id}`),
};

// ─── Seats API ────────────────────────────────────────────────────

export const seatsApi = {
  getByScreen: (screenId: string) =>
    api.get('/seats', { params: { screenId } }),

  bulkCreate: (data: { screenId: number; rows: number; seatsPerRow: number }) =>
    api.post('/seats/bulk', data),

  update: (
    id: number,
    data: Partial<{
      seatType: 'REGULAR' | 'PREMIUM' | 'VIP';
      isActive: boolean;
    }>
  ) => api.patch(`/seats/${id}`, data),

  delete: (id: number) => api.delete(`/seats/${id}`),
};

// ─── Bookings API ─────────────────────────────────────────────────

export const bookingsApi = {
  // Seat map + availability for a screening (any authenticated user)
  getSeats: (screeningId: number) =>
    api.get(`/bookings/screenings/${screeningId}/seats`),

  // Book one seat for a screening → returns ticket + unique QR (code + token)
  create: (data: { screeningId: number; seatId: number }) =>
    api.post('/bookings', data),

  // Current student's tickets, each with a freshly generated QR
  getMyTickets: () => api.get('/bookings/my-tickets'),

  // Cancel a ticket the student owns
  cancel: (ticketId: number) => api.delete(`/bookings/${ticketId}`),

  // Guard: validate + scan a QR token
  scan: (qrToken: string) => api.post('/bookings/scan', { qrToken }),

  // Admin: list every booking across all students + stats
  getAllBookings: () => api.get('/bookings/all'),
};

// ─── Screens API ──────────────────────────────────────────────────

export const screensApi = {
  getAll: (params?: { active?: boolean; search?: string; venue?: string }) =>
    api.get('/screens', { params }),

  getById: (id: number) => api.get(`/screens/${id}`),

  create: (data: {
    screenName: string;
    venue: string;
    description: string;
    isActive: boolean;
  }) => api.post('/screens', data),

  update: (
    id: number,
    data: Partial<{
      screenName: string;
      venue: string;
      description: string;
      isActive: boolean;
    }>
  ) => api.patch(`/screens/${id}`, data),

  delete: (id: number) => api.delete(`/screens/${id}`),
};


