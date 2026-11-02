import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { bookingsApi } from '../services/api.client';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { useDataChange } from '../hooks/dataEvents';
import './AdminBookings.css';

interface AdminBooking {
  ticketId: number;
  studentName: string;
  studentEmail: string;
  movieId: number;
  movieTitle: string;
  screeningId: number;
  screenId: number;
  screenName: string;
  venue: string;
  date: string;
  startTime: string;
  endTime: string;
  seatCode: string;
  seatType: 'REGULAR' | 'PREMIUM' | 'VIP';
  status: 'VALID' | 'SCANNED' | 'CANCELLED';
  bookedAt: string;
  scannedAt: string | null;
  scannedBy: string | null;
}

interface BookingStats {
  total: number;
  valid: number;
  scanned: number;
  cancelled: number;
}

const EMPTY_STATS: BookingStats = { total: 0, valid: 0, scanned: 0, cancelled: 0 };

const fmtDateTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};
const fmtScreening = (dateIso: string, timeIso: string) => {
  const d = new Date(dateIso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const t = new Date(timeIso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' });
  return `${d} · ${t}`;
};

export default function AdminBookings() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Admin Name';

  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [stats, setStats] = useState<BookingStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [screeningFilter, setScreeningFilter] = useState('');
  const [screenFilter, setScreenFilter] = useState('');
  const [seatTypeFilter, setSeatTypeFilter] = useState('');

  const fetchBookings = useCallback(async () => {
    try {
      setError('');
      const res = await bookingsApi.getAllBookings();
      setBookings(res.data?.data?.bookings ?? []);
      setStats(res.data?.data?.stats ?? EMPTY_STATS);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);
  useAutoRefresh(fetchBookings);
  useDataChange(['bookings'], fetchBookings);

  const handleLogoutHome = () => { logout(); navigate('/'); };

  // Distinct screenings / screens / seat types for the filter dropdowns.
  const screeningOptions = useMemo(() => {
    const map = new Map<number, string>();
    bookings.forEach(b => map.set(b.screeningId, `${b.movieTitle.trim()} — ${fmtScreening(b.date, b.startTime)}`));
    return Array.from(map.entries());
  }, [bookings]);

  const screenOptions = useMemo(() => {
    const map = new Map<number, string>();
    bookings.forEach(b => map.set(b.screenId, b.screenName));
    return Array.from(map.entries());
  }, [bookings]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bookings.filter(b => {
      if (q) {
        const hay = `${b.studentName} ${b.studentEmail} ${b.movieTitle} #${b.ticketId}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (statusFilter && b.status !== statusFilter) return false;
      if (screeningFilter && String(b.screeningId) !== screeningFilter) return false;
      if (screenFilter && String(b.screenId) !== screenFilter) return false;
      if (seatTypeFilter && b.seatType !== seatTypeFilter) return false;
      return true;
    });
  }, [bookings, search, statusFilter, screeningFilter, screenFilter, seatTypeFilter]);

  const clearFilters = () => {
    setSearch(''); setStatusFilter(''); setScreeningFilter(''); setScreenFilter(''); setSeatTypeFilter('');
  };

  const exportCsv = () => {
    const headers = ['Ticket ID', 'Student', 'Email', 'Movie', 'Screening', 'Screen', 'Seat', 'Seat Type', 'Booked At', 'Status', 'Scanned By'];
    const rows = filtered.map(b => [
      b.ticketId, b.studentName, b.studentEmail, b.movieTitle.trim(),
      fmtScreening(b.date, b.startTime), b.screenName, b.seatCode, b.seatType,
      fmtDateTime(b.bookedAt), b.status, b.scannedBy ?? '',
    ]);
    const csv = [headers, ...rows]
      .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unipass-bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusBadge = (status: AdminBooking['status']) => {
    const cls = status === 'SCANNED' ? 'scanned' : status === 'CANCELLED' ? 'cancelled' : 'valid';
    const label = status === 'SCANNED' ? 'Scanned' : status === 'CANCELLED' ? 'Cancelled' : 'Valid';
    return <span className={`bk-status-badge ${cls}`}>{label}</span>;
  };

  return (
    <div className="admin-bookings-page">
      {/* ─── Top Navbar ─────────────────────────────────────────── */}
      <nav className="admin-top-nav">
        <Link to="/" className="admin-logo-container">
          <img src="/logo.png" alt="UniPass Logo" />
          <span className="admin-logo-text">UniPass</span>
        </Link>
        <div className="admin-user-info">
          <div className="welcome-text">
            Welcome,
            <span className="name">{fullName}!</span>
          </div>
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`}
            alt="Admin Avatar"
            className="admin-avatar"
          />
        </div>
      </nav>

      {/* ─── Blue Secondary Nav ───────────────────────────────────── */}
      <div className="admin-blue-nav">
        <div className="admin-nav-links">
          <Link to="/admin/dashboard">Dashboard</Link>
          <Link to="/admin/movies">Movies</Link>
          <Link to="/admin/screens">Screens</Link>
          <Link to="/admin/seats">Seats</Link>
          <Link to="/admin/screenings">Screenings</Link>
          <Link to="/admin/bookings" className="active">Bookings</Link>
          <Link to="/admin/users">Users</Link>
          <Link to="/admin/profile">Profile</Link>
        </div>
        <button onClick={handleLogoutHome} className="admin-back-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Home
        </button>
      </div>

      <div className="admin-bookings-content">

        {/* ─── Header ────────────────────────────────────────────── */}
        <div className="bookings-header">
          <div className="bookings-header-text">
            <h1>Bookings</h1>
            <p>View and manage student ticket bookings across all screenings.</p>
          </div>
          <button className="btn-export" onClick={exportCsv} disabled={filtered.length === 0}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export Bookings
          </button>
        </div>

        {/* ─── Summary Stats Bar (real) ──────────────────────────── */}
        <div className="bookings-summary-bar">
          <span className="summary-item"><strong>Total Bookings:</strong> {stats.total}</span>
          <span className="summary-item"><strong>Valid:</strong> {stats.valid}</span>
          <span className="summary-item"><strong>Scanned:</strong> {stats.scanned}</span>
          <span className="summary-item"><strong>Cancelled:</strong> {stats.cancelled}</span>
        </div>

        {/* ─── Toolbar (Filters) ─────────────────────────────────── */}
        <div className="bookings-toolbar">
          <div className="toolbar-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input
              type="text"
              placeholder="Search by student, ticket ID, or movie..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="toolbar-filters">
            <div className="filter-group">
              <span className="filter-label">Status</span>
              <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Status</option>
                <option value="VALID">Valid</option>
                <option value="SCANNED">Scanned</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div className="filter-group">
              <span className="filter-label">Screening</span>
              <select className="filter-select" value={screeningFilter} onChange={(e) => setScreeningFilter(e.target.value)}>
                <option value="">All Screenings</option>
                {screeningOptions.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <span className="filter-label">Screen</span>
              <select className="filter-select" value={screenFilter} onChange={(e) => setScreenFilter(e.target.value)}>
                <option value="">All Screens</option>
                {screenOptions.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <span className="filter-label">Seat Type</span>
              <select className="filter-select" value={seatTypeFilter} onChange={(e) => setSeatTypeFilter(e.target.value)}>
                <option value="">All Types</option>
                <option value="REGULAR">Regular</option>
                <option value="PREMIUM">Premium</option>
                <option value="VIP">VIP</option>
              </select>
            </div>
            <button className="btn-clear-filters" onClick={clearFilters}>Clear Filters</button>
          </div>
        </div>

        {/* ─── Table Container ───────────────────────────────────── */}
        <div className="bookings-table-container">
          <div className="table-header">
            <h2>All Bookings</h2>
            <span className="subtitle">{filtered.length} of {bookings.length} bookings</span>
          </div>

          <table className="bookings-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Student</th>
                <th>Movie</th>
                <th>Screening</th>
                <th>Screen</th>
                <th>Seat</th>
                <th>Booked At</th>
                <th>Status</th>
                <th>Scanned By</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading bookings…</td></tr>
              ) : error ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#dc2626' }}>{error}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  {bookings.length === 0 ? 'No bookings yet.' : 'No bookings match your filters.'}
                </td></tr>
              ) : (
                filtered.map(b => (
                  <tr key={b.ticketId}>
                    <td className="fw-600">#{b.ticketId}</td>
                    <td>
                      <div className="bk-student">
                        <strong>{b.studentName}</strong>
                        <span>{b.studentEmail}</span>
                      </div>
                    </td>
                    <td>{b.movieTitle.trim()}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{fmtScreening(b.date, b.startTime)}</td>
                    <td>{b.screenName}</td>
                    <td><span className={`bk-seat type-${b.seatType.toLowerCase()}`}>{b.seatCode}</span></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{fmtDateTime(b.bookedAt)}</td>
                    <td>{statusBadge(b.status)}</td>
                    <td>{b.scannedBy ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="table-footer">
            <span className="showing-text">
              {bookings.length === 0 ? 'No bookings yet' : `Showing ${filtered.length} of ${bookings.length} bookings`}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
