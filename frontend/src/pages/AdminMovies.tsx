import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import './AdminMovies.css';

export default function AdminMovies() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogoutHome = () => {
    logout();
    navigate('/');
  };

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Admin Name';

  // Poster URLs – local generated for blanks, TMDB for rest
  const recentlyAdded = [
    { title: 'Interstellar', genre: 'Sci-Fi - English', duration: '169 min', status: 'Published', screenings: '3 Upcoming Screenings', poster: '/posters/interstellar.jpg' },
    { title: 'Inception', genre: 'Sci-Fi / Thriller', duration: '148 min', status: 'Published', screenings: '2 Upcoming, 2 screenings', poster: 'https://image.tmdb.org/t/p/w300/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg' },
    { title: 'The Dark Knight', genre: 'Action / Drama', duration: '152 min', status: 'Published', screenings: '3 Upcoming, 2 screenings', poster: 'https://image.tmdb.org/t/p/w300/qJ2tW6WMUDux911r6m7haRef0WH.jpg' },
    { title: 'Oppenheimer', genre: 'Biography / Drama', duration: '180 min', status: 'Published', screenings: '1 Upcoming, 1 screening', poster: 'https://image.tmdb.org/t/p/w300/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg' },
    { title: 'Barbie', genre: 'Comedy', duration: '114 min', status: 'Draft', screenings: '0 Upcoming 0 screenings', poster: 'https://image.tmdb.org/t/p/w300/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg' },
    { title: 'Avatar', genre: 'Sci-Fi', duration: '162 min', status: 'Published', screenings: '4 Upcoming, 4 screenings', poster: 'https://image.tmdb.org/t/p/w300/jRXYjXNq0Cs2TcJjLkki24MLp7u.jpg' },
    { title: 'Spider-Man: Across the Spider-Verse', genre: 'Animation', duration: '140 min', status: 'Published', screenings: '3 Upcoming 3 screenings', poster: 'https://image.tmdb.org/t/p/w300/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg' },
    { title: 'The Batman', genre: 'Action', duration: '176 min', status: 'Inactive', screenings: '0 Upcoming, 0 screenings', poster: 'https://image.tmdb.org/t/p/w300/74xTEgt7R36Fpooo50r9T25onhq.jpg' }
  ];

  return (
    <div className="admin-movies-page">
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
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
            alt="Admin Avatar"
            className="admin-avatar"
          />
        </div>
      </nav>

      {/* ─── Blue Secondary Nav ───────────────────────────────────── */}
      <div className="admin-blue-nav">
        <div className="admin-nav-links">
          <Link to="/admin/dashboard">Dashboard</Link>
          <Link to="/admin/movies" className="active">Movies</Link>
          <Link to="/admin/screens">Screens</Link>
          <Link to="/admin/seats">Seats</Link>
          <Link to="/admin/screenings">Screenings</Link>
          <Link to="/admin/bookings">Bookings</Link>
          <Link to="/admin/users">Users</Link>
          <Link to="/admin/profile">Profile</Link>
        </div>
        <button onClick={handleLogoutHome} className="admin-back-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Home
        </button>
      </div>

      <div className="admin-movies-content">
        {/* ─── Header ────────────────────────────────────────────── */}
        <div className="movies-header">
          <div className="movies-header-text">
            <h1>Movies</h1>
            <p>Manage the films available for UniPass screenings.</p>
          </div>
          <button className="admin-btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add Movie
          </button>
        </div>

        {/* ─── Toolbar (Search & Filters) ────────────────────────── */}
        <div className="movies-toolbar">
          <div className="toolbar-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Search movies by title..." />
          </div>
          
          <div className="toolbar-filter">
            <div className="admin-filter-group">
              <span className="label">Genre</span>
              <select><option>All Genres</option></select>
            </div>
            <div className="admin-filter-group">
              <span className="label">Language</span>
              <select><option>All Languages</option></select>
            </div>
            <div className="admin-filter-group">
              <span className="label">Status</span>
              <select><option>All Status</option></select>
            </div>
            <div className="admin-filter-group">
              <span className="label">Sort</span>
              <select><option>Recently Added</option></select>
            </div>
          </div>

          <div className="toolbar-view-toggle">
            <button className="view-btn active">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            </button>
            <button className="view-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            </button>
          </div>
        </div>

        {/* ─── Summary ───────────────────────────────────────────── */}
        <div className="movies-summary">
          25 Movies &bull; <span className="highlight-green">18 Published</span> &bull; <span className="highlight-gray">4 Draft</span> &bull; <span className="highlight-red">3 Inactive</span>
        </div>

        {/* ─── Featured / Top Highlights ─────────────────────────── */}
        <div className="featured-movies">
          <div className="featured-card">
            <img src="/posters/creator.jpg" alt="The Creator" className="featured-poster" />
            <div className="featured-info">
              <div className="featured-title">The Creator</div>
              <div className="featured-meta">Sci-Fi &bull; 133 min<br/>Added 2 hours ago</div>
              <span className="status-badge published">Published</span>
            </div>
          </div>
          <div className="featured-card">
            <img src="/posters/dune.jpg" alt="Dune Part Two" className="featured-poster" />
            <div className="featured-info">
              <div className="featured-title">Dune: Part Two</div>
              <div className="featured-meta">Sci-Fi &bull; 165 min<br/>Added 5 hours ago</div>
              <span className="status-badge draft">Draft</span>
            </div>
          </div>
        </div>

        {/* ─── Movie Grid ────────────────────────────────────────── */}
        <h2 className="movies-section-title">Recently Added</h2>
        <div className="movies-grid">
          {recentlyAdded.map((movie, i) => (
            <div key={i} className="admin-movie-card">
              <div className="admin-movie-card-left">
                <img 
                  src={movie.poster} 
                  alt={movie.title} 
                  className="movie-poster" 
                  onError={(e) => { e.currentTarget.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='; }} 
                />
              </div>
              <div className="admin-movie-card-right">
                <div className="movie-title">{movie.title}</div>
                <div className="movie-meta">{movie.genre} &bull; {movie.duration}</div>
                <span className={`status-badge ${movie.status.toLowerCase()}`}>
                  {movie.status}
                </span>
                <div className="screenings-info">{movie.screenings}</div>
                <div className="admin-movie-card-actions">
                  <button className="btn-outline">Manage Screenings</button>
                  <button className="btn-outline edit">Edit</button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
