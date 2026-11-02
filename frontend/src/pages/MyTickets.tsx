import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { bookingsApi } from '../services/api.client';
import { emitDataChange } from '../hooks/dataEvents';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import './MyTickets.css';

interface MyTicket {
  ticketId: number;
  status: 'VALID' | 'SCANNED' | 'CANCELLED';
  bookedAt: string;
  scannedAt: string | null;
  seatCode: string;
  seatType: string;
  movieTitle: string;
  moviePoster: string;
  genre: string;
  durationMinutes: number;
  screenName: string;
  venue: string;
  date: string;
  startTime: string;
  endTime: string;
  price: string | number;
  qrCode: string;
  qrToken: string;
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' });

export default function MyTickets() {
  const { user } = useAuthStore();
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Student';

  const [tickets, setTickets] = useState<MyTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const res = await bookingsApi.getMyTickets();
      setTickets(res.data?.data ?? []);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? 'Could not load your tickets.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useAutoRefresh(load);

  const handleCancel = async (t: MyTicket) => {
    if (!window.confirm(`Cancel your ticket for ${t.movieTitle} (seat ${t.seatCode})? This frees the seat for others.`)) return;
    try {
      await bookingsApi.cancel(t.ticketId);
      emitDataChange('bookings', 'screenings');
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.error?.message ?? 'Could not cancel this ticket.');
    }
  };

  const badge = (status: MyTicket['status']) => {
    if (status === 'SCANNED') return <span className="mt-badge scanned">Entered</span>;
    if (status === 'CANCELLED') return <span className="mt-badge cancelled">Cancelled</span>;
    return <span className="mt-badge valid">Valid</span>;
  };

  return (
    <div className="my-tickets-page">
      <nav className="mt-top-nav">
        <Link to="/" className="mt-logo">
          <img src="/logo.png" alt="UniPass" />
          <span>UniPass</span>
        </Link>
        <div className="mt-user">Welcome, {fullName}!</div>
      </nav>

      <nav className="mt-blue-nav">
        <Link to="/student/dashboard">Dashboard</Link>
        <Link to="/student/bookings">Bookings</Link>
        <Link to="/student/events">Events</Link>
        <Link to="/student/films">Films</Link>
        <Link to="/student/tickets" className="active">My Tickets</Link>
        <Link to="/student/profile">Profile</Link>
      </nav>

      <div className="mt-content">
        <div className="mt-header">
          <h1>My Tickets</h1>
          <p>Each ticket carries a unique QR valid only for that exact screening and seat.</p>
        </div>

        {loading ? (
          <div className="mt-empty">Loading your tickets…</div>
        ) : error ? (
          <div className="mt-empty error">{error}</div>
        ) : tickets.length === 0 ? (
          <div className="mt-empty">
            You have no tickets yet. <Link to="/student/films">Browse films</Link> to book one.
          </div>
        ) : (
          <div className="mt-grid">
            {tickets.map(t => {
              const past = new Date(t.date).getTime() < new Date(new Date().toDateString()).getTime();
              const canCancel = t.status === 'VALID' && !past;
              return (
                <div className={`mt-card ${t.status.toLowerCase()}`} key={t.ticketId}>
                  <div className="mt-card-left">
                    <img
                      src={t.moviePoster}
                      alt={t.movieTitle}
                      className="mt-poster"
                      onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }}
                    />
                    <div className="mt-info">
                      <div className="mt-title-row">
                        <h3>{t.movieTitle}</h3>
                        {badge(t.status)}
                      </div>
                      <div className="mt-meta">{t.genre} · {t.durationMinutes} min</div>
                      <div className="mt-detail"><span>Date</span><strong>{fmtDate(t.date)}</strong></div>
                      <div className="mt-detail"><span>Time</span><strong>{fmtTime(t.startTime)} &rarr; {fmtTime(t.endTime)}</strong></div>
                      <div className="mt-detail"><span>Screen</span><strong>{t.screenName} · {t.venue}</strong></div>
                      <div className="mt-detail"><span>Seat</span><strong>{t.seatCode} ({t.seatType})</strong></div>
                      <div className="mt-detail"><span>Ticket</span><strong>#{t.ticketId}</strong></div>
                      {canCancel && (
                        <button className="mt-cancel" onClick={() => handleCancel(t)}>Cancel Ticket</button>
                      )}
                    </div>
                  </div>

                  <div className="mt-qr">
                    {t.status === 'CANCELLED' ? (
                      <div className="mt-qr-void">Cancelled</div>
                    ) : (
                      <>
                        <img src={t.qrCode} alt={`QR for ticket ${t.ticketId}`} />
                        <span className="mt-qr-note">
                          {t.status === 'SCANNED' ? 'Already entered' : 'Show at entry'}
                        </span>
                      </>
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
