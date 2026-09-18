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

// ─── Response Interceptor — Handle 401 Globally ──────────────────

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
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
};

// ─── Movies API ───────────────────────────────────────────────────

export const moviesApi = {
  getAll: (params?: { active?: boolean }) =>
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
  getAll: (params?: { movieId?: number; date?: string }) =>
    api.get('/screenings', { params }),

  getById: (id: number) => api.get(`/screenings/${id}`),

  getSeats: (id: number) => api.get(`/screenings/${id}/seats`),
};

// ─── Bookings API ─────────────────────────────────────────────────

export const bookingsApi = {
  create: (data: { screening_id: number; seat_id: number }) =>
    api.post('/bookings', data),

  getMyBookings: () => api.get('/bookings'),

  cancel: (id: number) => api.patch(`/bookings/${id}/cancel`),
};

// ─── Tickets API ──────────────────────────────────────────────────

export const ticketsApi = {
  getMyTickets: () => api.get('/tickets'),
  getById: (id: number) => api.get(`/tickets/${id}`),
};

// ─── Scan API ─────────────────────────────────────────────────────

export const scanApi = {
  validate: (credential: string) =>
    api.post('/scan/validate', { credential }),

  getHistory: () => api.get('/scan/history'),
};
