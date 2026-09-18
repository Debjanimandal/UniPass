import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { moviesApi } from '../services/api.client';
import './Films.css';

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

export default function Films() {
  const { user } = useAuthStore();
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Student';
  const avatarUrl = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(user?.email ?? 'student');

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    moviesApi.getAll({ active: true })
      .then(res => setMovies(res.data?.data ?? []))
      .catch(() => console.error('Failed to load movies'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = movies.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="films-page">
      {/* ─── Top White Navbar ───────────────────────────────────── */}
      <nav className="films-top-nav">
        <Link to="/" className="films-logo-container">
          <img src="/logo.png" alt="UniPass Logo" />
          <span className="films-logo-text">UniPass</span>
        </Link>
        <div className="films-user-info">
          <span>Welcome, {fullName}!</span>
          <img src={avatarUrl} alt="User Avatar" className="films-avatar" />
        </div>
      </nav>

      {/* ─── Blue Secondary Nav ─────────────────────────────────── */}
      <nav className="films-blue-nav">
        <Link to="/student/dashboard">Dashboard</Link>
        <Link to="/student/bookings">Bookings</Link>
        <Link to="/student/events">Events</Link>
        <Link to="/student/films" className="active">Films</Link>
        <Link to="/student/profile">Profile</Link>
      </nav>

      {/* ─── Main Content Header ────────────────────────────────── */}
      <div className="films-header-container">
        <h1>Films</h1>
        <p>Discover and book university film screenings.</p>
      </div>

      {/* ─── Content Grid ───────────────────────────────────────── */}
      <div className="films-content-grid">

        {/* Left Column: Filters Sidebar */}
        <div className="filters-sidebar">
          <h2>Search & Filter</h2>
          <div className="filter-section">
            <h3>Search</h3>
            <input
              type="text"
              placeholder="Search by title or genre..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.88rem', boxSizing: 'border-box' }}
            />
          </div>
          <div className="filter-section">
            <h3>Genre</h3>
            <div className="checkbox-group">
              {['Sci-Fi', 'Drama', 'Comedy', 'Documentary', 'Animation', 'Action', 'Thriller'].map(g => (
                <label key={g} className="checkbox-label">
                  <input type="checkbox" onChange={e => setSearchQuery(e.target.checked ? g : '')} />
                  {g}
                </label>
              ))}
            </div>
          </div>
          <div className="filter-section">
            <h3>Language</h3>
            <div className="checkbox-group">
              <label className="checkbox-label"><input type="checkbox" /> English</label>
              <label className="checkbox-label"><input type="checkbox" /> Hindi</label>
              <label className="checkbox-label"><input type="checkbox" /> Regional</label>
            </div>
          </div>
        </div>

        {/* Right Column: Films List */}
        <div className="films-main-col">

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Loading films...</div>
          )}

          {/* Empty */}
          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
              {searchQuery ? 'No films match your search.' : 'No films available right now. Check back soon!'}
            </div>
          )}

          {/* Films Grid */}
          {!loading && filtered.length > 0 && (
            <div className="films-grid">
              {filtered.map(film => (
                <div key={film.movieId} className="film-card">
                  <img
                    src={film.posterUrl}
                    alt={film.title}
                    className="film-poster-small"
                    onError={e => { e.currentTarget.src = 'https://via.placeholder.com/80x120?text=No+Poster'; }}
                  />
                  <div className="film-card-details">
                    <h3>{film.title}</h3>
                    <p className="film-card-meta">{film.genre} &bull; {film.language} &bull; {film.durationMinutes} min</p>
                    <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '6px', lineHeight: '1.4' }}>
                      {film.description.length > 100 ? film.description.slice(0, 100) + '...' : film.description}
                    </p>
                    <div className="film-card-footer" style={{ marginTop: '12px' }}>
                      <Link to={`/student/films/${film.movieId}`} className="btn-book-seat">
                        View Screenings
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
