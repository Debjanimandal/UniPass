import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { moviesApi, screeningsApi } from '../services/api.client';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { useDataChange } from '../hooks/dataEvents';
import './MovieDetails.css';

interface Movie {
  movieId: number;
  title: string;
  description: string;
  durationMinutes: number;
  language: string;
  genre: string;
  posterUrl: string;
  isActive: boolean;
}

interface Screening {
  screeningId: number;
  movieId: number;
  date: string;
  startTime: string;
  endTime: string;
  price: string | number;
  isActive: boolean;
  screen?: { screenName: string; venue: string; _count?: { seats: number } };
  _count?: { tickets: number };
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' });

// Combine a screening's date (UTC midnight) with a UTC time into one moment.
const screeningEnd = (dateIso: string, timeIso: string) => {
  const d = new Date(dateIso);
  const t = new Date(timeIso);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), t.getUTCHours(), t.getUTCMinutes(), t.getUTCSeconds()));
};

export default function MovieDetails() {
  const { id } = useParams();
  const movieId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Student';

  const [movie, setMovie] = useState<Movie | null>(null);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!movieId) return;
    try {
      setError('');
      const [movieRes, scrRes] = await Promise.all([
        moviesApi.getById(movieId),
        screeningsApi.getAll({ movieId, active: true }),
      ]);
      setMovie(movieRes.data?.data ?? null);
      setScreenings(scrRes.data?.data ?? []);
    } catch {
      setError('Could not load this movie.');
    } finally {
      setLoading(false);
    }
  }, [movieId]);

  useEffect(() => { load(); }, [load]);
  useAutoRefresh(load);
  useDataChange(['movies', 'screenings'], load);

  // Only show upcoming, active screenings students can actually book.
  const now = Date.now();
  const upcoming = screenings
    .filter(s => s.isActive && screeningEnd(s.date, s.endTime).getTime() >= now)
    .sort((a, b) =>
      screeningEnd(a.date, a.startTime).getTime() - screeningEnd(b.date, b.startTime).getTime()
    );

  return (
    <div className="movie-details-page">
      <nav className="md-top-nav">
        <Link to="/" className="md-logo">
          <img src="/logo.png" alt="UniPass" />
          <span>UniPass</span>
        </Link>
        <div className="md-user">Welcome, {fullName}!</div>
      </nav>

      <nav className="md-blue-nav">
        <Link to="/student/dashboard">Dashboard</Link>
        <Link to="/student/bookings">Bookings</Link>
        <Link to="/student/events">Events</Link>
        <Link to="/student/films">Films</Link>
        <Link to="/student/tickets">My Tickets</Link>
        <Link to="/student/profile">Profile</Link>
      </nav>

      <div className="md-content">
        <Link to="/student/films" className="md-back">&larr; Back to Films</Link>

        {loading ? (
          <div className="md-empty">Loading…</div>
        ) : error || !movie ? (
          <div className="md-empty">{error || 'Movie not found.'}</div>
        ) : (
          <>
            <div className="md-hero">
              <img className="md-poster" src={movie.posterUrl} alt={movie.title}
                   onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }} />
              <div className="md-hero-info">
                <h1>{movie.title}</h1>
                <div className="md-meta">
                  <span className="md-chip">{movie.genre}</span>
                  <span className="md-chip">{movie.language}</span>
                  <span className="md-chip">{movie.durationMinutes} min</span>
                </div>
                <p className="md-desc">{movie.description}</p>
              </div>
            </div>

            <div className="md-screenings">
              <h2>Available Screenings</h2>
              {upcoming.length === 0 ? (
                <div className="md-empty">No upcoming screenings for this film yet. Check back soon.</div>
              ) : (
                <div className="md-screening-list">
                  {upcoming.map(s => {
                    const capacity = s.screen?._count?.seats ?? 0;
                    const booked = s._count?.tickets ?? 0;
                    const available = Math.max(0, capacity - booked);
                    const soldOut = capacity > 0 && available === 0;
                    return (
                      <div className="md-screening-card" key={s.screeningId}>
                        <div className="md-screening-main">
                          <span className="md-screening-date">{fmtDate(s.date)}</span>
                          <span className="md-screening-time">{fmtTime(s.startTime)} &rarr; {fmtTime(s.endTime)}</span>
                        </div>
                        <div className="md-screening-screen">
                          <strong>{s.screen?.screenName}</strong>
                          <span>{s.screen?.venue}</span>
                        </div>
                        <div className="md-screening-avail">
                          {soldOut ? <span className="sold-out">Sold out</span> : <span>{available} seats left</span>}
                        </div>
                        <div className="md-screening-price">&#8377;{s.price}</div>
                        <button
                          className="md-book-btn"
                          disabled={soldOut}
                          onClick={() => navigate(`/student/screenings/${s.screeningId}/book`)}
                        >
                          {soldOut ? 'Sold Out' : 'Select Seat'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
