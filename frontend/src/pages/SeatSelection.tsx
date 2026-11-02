import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { bookingsApi } from '../services/api.client';
import { emitDataChange } from '../hooks/dataEvents';
import './SeatSelection.css';

interface SeatCell {
  seatId: number;
  seatCode: string;
  rowNo: number;
  seatNo: number;
  seatType: 'REGULAR' | 'PREMIUM' | 'VIP';
  isBooked: boolean;
}

interface SeatMap {
  screening: {
    screeningId: number;
    movieTitle: string;
    durationMinutes: number;
    screenName: string;
    venue: string;
    date: string;
    startTime: string;
    endTime: string;
    price: string | number;
  };
  seats: SeatCell[];
  totalSeats: number;
  bookedSeats: number;
  availableSeats: number;
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' });

export default function SeatSelection() {
  const { id } = useParams();
  const screeningId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Student';

  const [map, setMap] = useState<SeatMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<SeatCell | null>(null);
  const [booking, setBooking] = useState(false);
  // Seat code the student already holds for THIS screening (one per screening).
  const [existingSeat, setExistingSeat] = useState<string | null>(null);

  // Reload the seat map (optionally preserving the current error message).
  const load = useCallback(async (opts?: { keepError?: boolean }) => {
    if (!screeningId) return;
    try {
      if (!opts?.keepError) setError('');
      const [seatsRes, ticketsRes] = await Promise.all([
        bookingsApi.getSeats(screeningId),
        bookingsApi.getMyTickets().catch(() => null),
      ]);
      setMap(seatsRes.data?.data ?? null);

      // Detect an existing non-cancelled booking for this screening.
      const myTickets: Array<{ screeningId: number; status: string; seatCode: string }> =
        ticketsRes?.data?.data ?? [];
      const mine = myTickets.find(t => t.screeningId === screeningId && t.status !== 'CANCELLED');
      setExistingSeat(mine ? mine.seatCode : null);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? 'Could not load seats for this screening.');
    } finally {
      setLoading(false);
    }
  }, [screeningId]);

  useEffect(() => { load(); setSelected(null); }, [load]);

  const handleBook = async () => {
    if (!selected) return;
    setBooking(true);
    setError('');
    try {
      const res = await bookingsApi.create({ screeningId, seatId: selected.seatId });
      emitDataChange('bookings', 'screenings');
      // Hand the booking result (incl. unique QR) to the confirmation page.
      navigate('/student/booking-confirmation', { state: { booking: res.data?.data } });
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message ?? 'Booking failed. Please try again.';
      setError(msg);
      // Refresh the map so newly-taken seats show as booked, but KEEP the error
      // visible and keep the user's selection so they understand what happened.
      await load({ keepError: true });
    } finally {
      setBooking(false);
    }
  };

  const rows = map ? Array.from(new Set(map.seats.map(s => s.rowNo))).sort((a, b) => a - b) : [];
  const maxSeatNo = map ? Math.max(...map.seats.map(s => s.seatNo), 1) : 1;

  const seatClass = (s: SeatCell) => {
    if (s.isBooked) return 'seat booked';
    if (selected?.seatId === s.seatId) return 'seat selected';
    if (s.seatType === 'VIP') return 'seat vip';
    if (s.seatType === 'PREMIUM') return 'seat premium';
    return 'seat available';
  };

  return (
    <div className="seat-sel-page">
      <nav className="ss-top-nav">
        <Link to="/" className="ss-logo">
          <img src="/logo.png" alt="UniPass" />
          <span>UniPass</span>
        </Link>
        <div className="ss-user">Welcome, {fullName}!</div>
      </nav>

      <div className="ss-content">
        <button className="ss-back" onClick={() => navigate(-1)}>&larr; Back</button>
        <h1>Select Your Seat</h1>

        {loading ? (
          <div className="ss-empty">Loading seats…</div>
        ) : error && !map ? (
          <div className="ss-empty error">{error}</div>
        ) : map ? (
          <div className="ss-layout">
            {/* Seat map */}
            <div className="ss-map-panel">
              <div className="ss-screen-bar">SCREEN</div>
              <div className="ss-grid">
                {rows.map(rowNo => {
                  const rowSeats = map.seats.filter(s => s.rowNo === rowNo);
                  const label = rowSeats[0]?.seatCode.replace(/[0-9]/g, '') ?? '';
                  return (
                    <div className="ss-row" key={rowNo}>
                      <span className="ss-row-label">{label}</span>
                      <div className="ss-row-seats" style={{ gridTemplateColumns: `repeat(${maxSeatNo}, 1fr)` }}>
                        {rowSeats.map(s => (
                          <button
                            key={s.seatId}
                            className={seatClass(s)}
                            style={{ gridColumnStart: s.seatNo }}
                            disabled={s.isBooked}
                            title={`${s.seatCode} · ${s.seatType}${s.isBooked ? ' (booked)' : ''}`}
                            onClick={() => setSelected(s)}
                          >
                            {s.seatNo}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="ss-legend">
                <span><i className="dot available" /> Available</span>
                <span><i className="dot premium" /> Premium</span>
                <span><i className="dot vip" /> VIP</span>
                <span><i className="dot selected" /> Selected</span>
                <span><i className="dot booked" /> Booked</span>
              </div>
            </div>

            {/* Summary / confirm */}
            <div className="ss-summary-panel">
              <h2>{map.screening.movieTitle}</h2>
              <div className="ss-summary-row"><span>Date</span><strong>{fmtDate(map.screening.date)}</strong></div>
              <div className="ss-summary-row"><span>Time</span><strong>{fmtTime(map.screening.startTime)} &rarr; {fmtTime(map.screening.endTime)}</strong></div>
              <div className="ss-summary-row"><span>Screen</span><strong>{map.screening.screenName}</strong></div>
              <div className="ss-summary-row"><span>Venue</span><strong>{map.screening.venue}</strong></div>
              <div className="ss-summary-row"><span>Seat</span><strong>{selected ? `${selected.seatCode} (${selected.seatType})` : '—'}</strong></div>
              <div className="ss-summary-row total"><span>Price</span><strong>&#8377;{map.screening.price}</strong></div>

              <div className="ss-avail-note">{map.availableSeats} of {map.totalSeats} seats available</div>

              {existingSeat && (
                <div className="ss-inline-note">
                  You already have seat <strong>{existingSeat}</strong> booked for this screening.
                  View it under <Link to="/student/tickets">My Tickets</Link>.
                </div>
              )}

              {error && <div className="ss-inline-error">{error}</div>}

              {existingSeat ? (
                <button className="ss-confirm-btn" onClick={() => navigate('/student/tickets')}>
                  Go to My Tickets
                </button>
              ) : (
                <button className="ss-confirm-btn" disabled={!selected || booking} onClick={handleBook}>
                  {booking ? 'Booking…' : selected ? `Book Seat ${selected.seatCode}` : 'Select a seat'}
                </button>
              )}
              <p className="ss-note">You can book one seat per screening. A unique QR ticket will be issued.</p>
            </div>
          </div>
        ) : (
          <div className="ss-empty">No seats found.</div>
        )}
      </div>
    </div>
  );
}
