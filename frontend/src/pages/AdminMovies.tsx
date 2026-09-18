import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { moviesApi } from '../services/api.client';
import './AdminMovies.css';

interface Movie {
  movieId: number;
  title: string;
  description: string;
  durationMinutes: number;
  language: string;
  genre: string;
  posterUrl: string;
  isActive: boolean;
  validUntil?: string | null;
  createdAt: string;
  _count?: { screenings: number };
}

const EMPTY_FORM = {
  title: '', description: '', durationMinutes: '', language: '', genre: '', posterUrl: '', isActive: true, validUntil: ''
};

export default function AdminMovies() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Admin';

  // ─── Fetch movies from backend ────────────────────────────────────
  const fetchMovies = async () => {
    try {
      const res = await moviesApi.getAll();
      setMovies(res.data?.data ?? []);
    } catch {
      console.error('Failed to fetch movies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMovies(); }, []);

  const handleLogoutHome = () => { logout(); navigate('/'); };

  // ─── Open modal for Add ───────────────────────────────────────────
  const openAdd = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setFormError('');
    setShowModal(true);
  };

  // ─── Open modal for Edit ──────────────────────────────────────────
  const openEdit = (movie: Movie) => {
    setEditingId(movie.movieId);
    setForm({
      title: movie.title,
      description: movie.description,
      durationMinutes: String(movie.durationMinutes),
      language: movie.language,
      genre: movie.genre,
      posterUrl: movie.posterUrl,
      isActive: movie.isActive,
      validUntil: movie.validUntil ? movie.validUntil.split('T')[0] : '',
    });
    setFormError('');
    setShowModal(true);
  };

  // ─── Save (create or update) ──────────────────────────────────────
  const handleSave = async () => {
    setFormError('');
    if (!form.title || !form.description || !form.durationMinutes || !form.language || !form.genre || !form.posterUrl) {
      setFormError('All fields are required.');
      return;
    }
    const duration = parseInt(String(form.durationMinutes));
    if (isNaN(duration) || duration <= 0) { setFormError('Duration must be a positive number.'); return; }

    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        durationMinutes: duration,
        language: form.language,
        genre: form.genre,
        posterUrl: form.posterUrl,
        isActive: form.isActive,
        validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : null,
      };
      if (editingId) {
        await moviesApi.update(editingId, payload);
      } else {
        await moviesApi.create(payload);
      }
      setShowModal(false);
      await fetchMovies();
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message ?? 'Failed to save movie. Check all fields.';
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────
  const handleDelete = async (movieId: number, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await moviesApi.delete(movieId);
      await fetchMovies();
    } catch {
      alert('Failed to delete movie.');
    }
  };

  // ─── Toggle active ────────────────────────────────────────────────
  const toggleActive = async (movie: Movie) => {
    try {
      await moviesApi.update(movie.movieId, { isActive: !movie.isActive });
      await fetchMovies();
    } catch {
      alert('Failed to update status.');
    }
  };

  // Computed stats
  const filtered = movies.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const activeCount = movies.filter(m => m.isActive).length;
  const inactiveCount = movies.filter(m => !m.isActive).length;

  return (
    <div className="admin-movies-page">
      {/* ─── Top Navbar ───────────────────────────────────────── */}
      <nav className="admin-top-nav">
        <Link to="/" className="admin-logo-container">
          <img src="/logo.png" alt="UniPass Logo" />
          <span className="admin-logo-text">UniPass</span>
        </Link>
        <div className="admin-user-info">
          <div className="welcome-text">Welcome, <span className="name">{fullName}!</span></div>
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Avatar" className="admin-avatar" />
        </div>
      </nav>

      {/* ─── Blue Secondary Nav ───────────────────────────────── */}
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
        {/* ─── Header ─────────────────────────────────────────── */}
        <div className="movies-header">
          <div className="movies-header-text">
            <h1>Movies</h1>
            <p>Manage the films available for UniPass screenings.</p>
          </div>
          <button className="admin-btn-primary" onClick={openAdd}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add Movie
          </button>
        </div>

        {/* ─── Toolbar ────────────────────────────────────────── */}
        <div className="movies-toolbar">
          <div className="toolbar-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Search movies by title..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>

        {/* ─── Summary ────────────────────────────────────────── */}
        <div className="movies-summary">
          {movies.length} Movies &bull; <span className="highlight-blue">{activeCount} Active</span> &bull; <span className="highlight-gray">{inactiveCount} Inactive</span>
        </div>

        {/* ─── Loading ────────────────────────────────────────── */}
        {loading && <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Loading movies...</div>}

        {/* ─── Empty ──────────────────────────────────────────── */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
            {searchQuery ? 'No movies match your search.' : 'No movies yet. Click "+ Add Movie" to create the first one.'}
          </div>
        )}

        {/* ─── Movie Grid ─────────────────────────────────────── */}
        {!loading && filtered.length > 0 && (
          <>
            <h2 className="movies-section-title">All Movies</h2>
            <div className="movies-grid">
              {filtered.map((movie) => (
                <div key={movie.movieId} className="admin-movie-card">
                  <div className="admin-movie-card-left">
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="movie-poster"
                      onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/80x120?text=No+Poster'; }}
                    />
                  </div>
                  <div className="admin-movie-card-right">
                    <div className="movie-title">{movie.title}</div>
                    <div className="movie-meta">{movie.genre} &bull; {movie.language} &bull; {movie.durationMinutes} min</div>
                    {(() => {
                      const isExpired = movie.validUntil && new Date(movie.validUntil) < new Date();
                      
                      let daysText = '';
                      if (movie.validUntil && !isExpired) {
                        const daysLeft = Math.ceil((new Date(movie.validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        daysText = ` • ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`;
                      }

                      if (!movie.isActive) return <span className="status-badge inactive">Inactive{daysText}</span>;
                      if (isExpired) return <span className="status-badge warning" style={{ background: '#f59e0b', color: '#fff' }}>Expired</span>;
                      return <span className="status-badge published">Active{daysText}</span>;
                    })()}
                    <div className="screenings-info">{movie._count?.screenings ?? 0} Screenings</div>
                    <div className="admin-movie-card-actions">
                      <button className="btn-outline" onClick={() => toggleActive(movie)}>
                        {movie.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className="btn-outline edit" style={{ color: '#fff', background: '#1e3a8a', border: '1px solid #1e3a8a' }} onClick={() => openEdit(movie)}>Edit</button>
                      <button className="btn-outline" onClick={() => handleDelete(movie.movieId, movie.title)}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ─── Add / Edit Modal ───────────────────────────────────── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Movie' : 'Add New Movie'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>

            {formError && <div className="modal-error">{formError}</div>}

            <div className="modal-body">
              <div className="modal-field">
                <label>Title *</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Interstellar" />
              </div>
              <div className="modal-field">
                <label>Description *</label>
                <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description of the film..." />
              </div>
              <div className="modal-row">
                <div className="modal-field">
                  <label>Genre *</label>
                  <input type="text" value={form.genre} onChange={e => setForm(f => ({ ...f, genre: e.target.value }))} placeholder="e.g. Sci-Fi" />
                </div>
                <div className="modal-field">
                  <label>Language *</label>
                  <input type="text" value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))} placeholder="e.g. English" />
                </div>
              </div>
              <div className="modal-field">
                <label>Duration (minutes) *</label>
                <input type="number" value={form.durationMinutes} onChange={e => setForm(f => ({ ...f, durationMinutes: e.target.value }))} placeholder="e.g. 148" min="1" />
              </div>
              <div className="modal-field">
                <label>Poster URL *</label>
                <input type="url" value={form.posterUrl} onChange={e => setForm(f => ({ ...f, posterUrl: e.target.value }))} placeholder="https://image.tmdb.org/..." />
              </div>
              {form.posterUrl && (
                <div className="modal-poster-preview">
                  <img src={form.posterUrl} alt="Poster Preview" onError={e => { e.currentTarget.style.display='none'; }} />
                </div>
              )}
              <div className="modal-field modal-toggle-row">
                <label>Active (visible to students)</label>
                <label className="toggle-switch">
                  <input type="checkbox" checked={Boolean(form.isActive)} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="modal-field">
                <label>Valid Until (Optional)</label>
                <input type="date" value={form.validUntil} onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', marginTop: '6px' }} />
                <span style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', display: 'block' }}>If set, the movie will automatically expire after this date.</span>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-save" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : (editingId ? 'Save Changes' : 'Add Movie')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
