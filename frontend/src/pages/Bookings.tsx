import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { bookingsApi } from '../services/api.client';
import { emitDataChange } from '../hooks/dataEvents';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import './Bookings.css';

interface MyBooking {
  ticketId: number;
  status: 'VALID' | 'SCANNED' | 'CANCELLED';
  seatCode: string;
  seatType: string;
  movieTitle: string;
  moviePoster: string;
  screenName: string;
  venue: string;
  date: string;
  startTime: string;
  endTime: string;
  price: string | number;
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' });

export default function Bookings() {
  const { user } = useAuthStore();
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Student';

  const [bookings, setBookings] = useState<MyBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const res = await bookingsApi.getMyTickets();
      setBookings(res.data?.data ?? []);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? 'Could not load your bookings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useAutoRefresh(load);

  const handleCancel = async (b: MyBooking) => {
    if (!window.confirm(`Cancel your booking for ${b.movieTitle} (seat ${b.seatCode})?`)) return;
    try {
      await bookingsApi.cancel(b.ticketId);
      emitDataChange('bookings', 'screenings');
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.error?.message ?? 'Could not cancel this booking.');
    }
  };

  const badge = (status: MyBooking['status']) => {
    if (status === 'SCANNED') return <span className="bk-badge scanned">Entered</span>;
    if (status === 'CANCELLED') return <span className="bk-badge cancelled">Cancelled</span>;
    return <span className="bk-badge valid">Confirmed</span>;
  };

  return (
    <div className="bookings-page">
      {/* ─── Top White Navbar ──────────────────────────────────────── */}
      <nav className="bookings-top-nav">
        <Link to="/" className="bookings-logo-container">
          <img src="/logo.png" alt="UniPass Logo" />
          <span className="bookings-logo-text">UniPass</span>
        </Link>
        <div className="bookings-user-info">
          <span>Welcome, {fullName}!</span>
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`}
            alt="User Avatar"
            className="bookings-avatar"
          />
        </div>
      </nav>

      {/* ─── Blue Secondary Nav ────────────────────────────────────── */}
      <nav className="bookings-blue-nav">
        <Link to="/student/dashboard">Dashboard</Link>
        <Link to="/student/bookings" className="active">Bookings</Link>
        <Link to="/student/events">Events</Link>
        <Link to="/student/films">Films</Link>
        <Link to="/student/tickets">My Tickets</Link>
        <Link to="/student/profile">Profile</Link>
      </nav>

      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div className="bookings-header-container">
        <div className="bookings-header-left">
          <h1>My Bookings</h1>
          <p>Your real screening bookings. To book a new one, pick a film and choose a seat.</p>
        </div>
        <Link to="/student/films" className="bk-browse-btn">Browse Films</Link>
      </div>

      <div className="bk-content">
        {loading ? (
          <div className="bk-empty">Loading your bookings…</div>
        ) : error ? (
          <div className="bk-empty error">{error}</div>
        ) : bookings.length === 0 ? (
          <div className="bk-empty">
            You have no bookings yet. <Link to="/student/films">Browse films</Link> to book a seat.
          </div>
        ) : (
          <div className="bk-list">
            {bookings.map(b => {
              const past = new Date(b.date).getTime() < new Date(new Date().toDateString()).getTime();
              const canCancel = b.status === 'VALID' && !past;
              return (
                <div className={`bk-card ${b.status.toLowerCase()}`} key={b.ticketId}>
                  <img
                    src={b.moviePoster}
                    alt={b.movieTitle}
                    className="bk-poster"
                    onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }}
                  />
                  <div className="bk-info">
                    <div className="bk-title-row">
                      <h3>{b.movieTitle}</h3>
                      {badge(b.status)}
                    </div>
                    <div className="bk-detail"><span>Date</span><strong>{fmtDate(b.date)}</strong></div>
                    <div className="bk-detail"><span>Time</span><strong>{fmtTime(b.startTime)} &rarr; {fmtTime(b.endTime)}</strong></div>
                    <div className="bk-detail"><span>Screen</span><strong>{b.screenName} · {b.venue}</strong></div>
                    <div className="bk-detail"><span>Seat</span><strong>{b.seatCode} ({b.seatType})</strong></div>
                    <div className="bk-detail"><span>Price</span><strong>&#8377;{b.price}</strong></div>
                  </div>
                  <div className="bk-actions">
                    <Link to="/student/tickets" className="bk-view-ticket">View QR Ticket</Link>
                    {canCancel && (
                      <button className="bk-cancel" onClick={() => handleCancel(b)}>Cancel</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
