import { Link, useLocation, useNavigate } from 'react-router-dom';
import './BookingConfirmation.css';

interface BookingResult {
  ticket: {
    ticketId: number;
    status: string;
    seatCode: string;
    seatType: string;
    movieTitle: string;
    screenName: string;
    venue: string;
    date: string;
    startTime: string;
    endTime: string;
    price: string | number;
    studentName: string;
    studentEmail: string;
  };
  qrCode: string;   // base64 PNG data URL
  qrToken: string;
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' });

export default function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = (location.state as { booking?: BookingResult } | null)?.booking;

  if (!booking) {
    return (
      <div className="bc-page">
        <div className="bc-card bc-empty">
          <h1>No booking to show</h1>
          <p>Looks like you reached this page directly. Your tickets are available any time.</p>
          <Link to="/student/tickets" className="bc-btn primary">Go to My Tickets</Link>
        </div>
      </div>
    );
  }

  const t = booking.ticket;

  return (
    <div className="bc-page">
      <div className="bc-card">
        <div className="bc-check">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <polyline points="8 12 11 15 16 9" />
          </svg>
        </div>
        <h1>Booking Confirmed!</h1>
        <p className="bc-sub">Your seat is reserved. Show this QR code at the venue entrance.</p>

        <div className="bc-ticket">
          <div className="bc-ticket-info">
            <h2>{t.movieTitle}</h2>
            <div className="bc-row"><span>Date</span><strong>{fmtDate(t.date)}</strong></div>
            <div className="bc-row"><span>Time</span><strong>{fmtTime(t.startTime)} &rarr; {fmtTime(t.endTime)}</strong></div>
            <div className="bc-row"><span>Screen</span><strong>{t.screenName}</strong></div>
            <div className="bc-row"><span>Venue</span><strong>{t.venue}</strong></div>
            <div className="bc-row"><span>Seat</span><strong>{t.seatCode} ({t.seatType})</strong></div>
            <div className="bc-row"><span>Ticket ID</span><strong>#{t.ticketId}</strong></div>
            <div className="bc-row"><span>Attendee</span><strong>{t.studentName}</strong></div>
            <div className="bc-row total"><span>Paid</span><strong>&#8377;{t.price}</strong></div>
          </div>

          <div className="bc-qr">
            <img src={booking.qrCode} alt="Your ticket QR code" />
            <span className="bc-qr-note">Unique to this booking</span>
          </div>
        </div>

        <div className="bc-warning">
          This QR is valid only for <strong>{t.movieTitle}</strong> on {fmtDate(t.date)} at {fmtTime(t.startTime)},
          seat {t.seatCode}. It cannot be used for any other show, seat, or person.
        </div>

        <div className="bc-actions">
          <button className="bc-btn primary" onClick={() => navigate('/student/tickets')}>View My Tickets</button>
          <button className="bc-btn" onClick={() => navigate('/student/films')}>Book Another</button>
        </div>
      </div>
    </div>
  );
}
