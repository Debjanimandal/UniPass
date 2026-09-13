import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ComingSoon from './pages/ComingSoon';
import StudentDashboard from './pages/StudentDashboard';
import Bookings from './pages/Bookings';
import Events from './pages/Events';
import Films from './pages/Films';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminMovies from './pages/AdminMovies';
import AdminScreens from './pages/AdminScreens';
import AdminSeats from './pages/AdminSeats';
import AdminScreenings from './pages/AdminScreenings';
import AdminBookings from './pages/AdminBookings';
import AdminUsers from './pages/AdminUsers';
import AdminProfile from './pages/AdminProfile';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 minutes
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* ─── Public Routes ─────────────────────────────────── */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/films" element={<ComingSoon title="Films" description="Browse all campus films and upcoming screenings." />} />
          <Route path="/events" element={<ComingSoon title="Events & Screenings" description="View all upcoming screenings with dates, times, and availability." />} />

          {/* ─── Student Routes ─────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/films" element={<Films />} />
            <Route path="/student/events" element={<Events />} />
            <Route path="/student/movies/:id" element={<ComingSoon title="Movie Details" />} />
            <Route path="/student/screenings/:id" element={<ComingSoon title="Screening Details" />} />
            <Route path="/student/screenings/:id/book" element={<ComingSoon title="Select Your Seat" />} />
            <Route path="/student/booking-confirmation" element={<ComingSoon title="Booking Confirmed!" />} />
            <Route path="/student/bookings" element={<Bookings />} />
            <Route path="/student/tickets" element={<ComingSoon title="My Tickets" />} />
            <Route path="/student/tickets/:id" element={<ComingSoon title="Digital Ticket" />} />
            <Route path="/student/profile" element={<Profile />} />
          </Route>

          {/* ─── Guard Routes ────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['GUARD']} />}>
            <Route path="/guard/scan" element={<ComingSoon title="QR Scanner" description="Scan student QR tickets for venue entry." />} />
            <Route path="/guard/history" element={<ComingSoon title="Scan History" />} />
          </Route>

          {/* ─── Admin Routes ────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/movies" element={<AdminMovies />} />
            <Route path="/admin/screens" element={<AdminScreens />} />
            <Route path="/admin/seats" element={<AdminSeats />} />
            <Route path="/admin/screenings" element={<AdminScreenings />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/scans" element={<ComingSoon title="Entry & Scan Monitoring" />} />
          </Route>

          {/* ─── Fallback ────────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
