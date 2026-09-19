import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { moviesApi, screensApi, screeningsApi } from '../services/api.client';
import './AdminScreenings.css';

interface Movie {
  movieId: number;
  title: string;
  posterUrl: string;
  durationMinutes: number;
  validUntil?: string;
  createdAt?: string;
}

interface ScreenData {
  screenId: number;
  screenName: string;
  venue: string;
  _count?: { seats: number };
}

interface ScreeningData {
  screeningId: number;
  movieId: number;
  screenId: number;
  date: string;
  startTime: string;
  endTime: string;
  price: string;
  isActive: boolean;
  movie?: Movie;
  screen?: ScreenData;
  _count?: { tickets: number };
}

const EMPTY_FORM = {
  movieId: '',
  screenId: '',
  price: '',
  isActive: true,
};

const EMPTY_BULK_STATE = {
  startDate: '',
  endDate: '',
  timings: [''], // Array of start times
};

export default function AdminScreenings() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [screenings, setScreenings] = useState<ScreeningData[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [screens, setScreens] = useState<ScreenData[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Filters
  const [filterMovie, setFilterMovie] = useState('');
  const [filterScreen, setFilterScreen] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  
  // Edit mode specific state
  const [editDate, setEditDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  
  // Bulk creation specific state
  const [bulkState, setBulkState] = useState({ ...EMPTY_BULK_STATE });

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Admin';

  const handleLogoutHome = () => {
    logout();
    navigate('/');
  };

  const fetchData = async () => {
    try {
      const [screeningsRes, moviesRes, screensRes] = await Promise.all([
        screeningsApi.getAll(),
        moviesApi.getAll(),
        screensApi.getAll()
      ]);
      setScreenings(screeningsRes.data?.data ?? []);
      setMovies(moviesRes.data?.data ?? []);
      setScreens(screensRes.data?.data ?? []);
    } catch (err) {
      console.error('Failed to fetch screenings data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setBulkState({ startDate: '', endDate: '', timings: [''] });
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (s: ScreeningData) => {
    setEditingId(s.screeningId);
    
    const extractTime = (iso: string) => {
      if (!iso) return '';
      const d = new Date(iso);
      const h = String(d.getUTCHours()).padStart(2, '0');
      const m = String(d.getUTCMinutes()).padStart(2, '0');
      return `${h}:${m}`;
    };

    setForm({
      movieId: String(s.movieId),
      screenId: String(s.screenId),
      price: String(s.price),
      isActive: s.isActive,
    });
    setEditDate(s.date ? s.date.split('T')[0] : '');
    setEditStartTime(extractTime(s.startTime));
    setFormError('');
    setShowModal(true);
  };

  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    if (!startTime || !durationMinutes) return '--:--';
    const [h, m] = startTime.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return '--:--';
    const d = new Date();
    d.setHours(h);
    d.setMinutes(m + durationMinutes);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const handleSave = async () => {
    setFormError('');
    const selectedMovie = movies.find(m => String(m.movieId) === form.movieId);
    
    if (!form.movieId || !form.screenId || !form.price) {
      setFormError('Movie, Screen, and Price are required.');
      return;
    }

    // Validation: Check if screening date exceeds movie's valid limits
    if (selectedMovie) {
      const validUntilDate = selectedMovie.validUntil ? new Date(selectedMovie.validUntil) : null;
      if (validUntilDate) validUntilDate.setHours(23,59,59,999);
      
      const validFromDate = selectedMovie.createdAt ? new Date(selectedMovie.createdAt) : null;
      if (validFromDate) validFromDate.setHours(0,0,0,0);
      
      if (editingId) {
        const d = editDate ? new Date(editDate) : null;
        
        if (d && validFromDate && d < validFromDate) {
          setFormError("Can't select: the date is not valid for the movie (before movie start date).");
          return;
        }
        if (d && validUntilDate && d > validUntilDate) {
          setFormError('The movie is not valid for this date. Change your movie settings first.');
          return;
        }
      } else {
        const sd = bulkState.startDate ? new Date(bulkState.startDate) : null;
        const ed = bulkState.endDate ? new Date(bulkState.endDate) : null;
        
        if (sd && validFromDate && sd < validFromDate) {
          setFormError("Can't select: the date is not valid for the movie (before movie start date).");
          return;
        }
        if (ed && validUntilDate && ed > validUntilDate) {
          setFormError('The movie is not valid for this date range. Change your movie settings first.');
          return;
        }
      }
    }

    setSaving(true);
    try {
      if (editingId) {
        if (!editDate || !editStartTime) {
          setFormError('Date and Start Time are required.');
          setSaving(false);
          return;
        }
        
        const calculatedEndTime = calculateEndTime(editStartTime, selectedMovie?.durationMinutes || 120);

        await screeningsApi.update(editingId, {
          movieId: Number(form.movieId),
          screenId: Number(form.screenId),
          date: editDate,
          startTime: editStartTime,
          endTime: calculatedEndTime,
          price: Number(form.price),
          isActive: form.isActive,
        });
      } else {
        // Bulk Creation
        if (!bulkState.startDate || !bulkState.endDate || bulkState.timings.length === 0 || bulkState.timings.some(t => !t)) {
          setFormError('Start date, end date, and all timings must be filled.');
          setSaving(false);
          return;
        }

        const calculatedTimings = bulkState.timings.map(t => ({
          startTime: t,
          endTime: calculateEndTime(t, selectedMovie?.durationMinutes || 120)
        }));

        await screeningsApi.createBulk({
          movieId: Number(form.movieId),
          screenId: Number(form.screenId),
          startDate: bulkState.startDate,
          endDate: bulkState.endDate,
          timings: calculatedTimings,
          price: Number(form.price),
          isActive: form.isActive,
        });
      }
      setShowModal(false);
      await fetchData();
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message ?? 'Failed to save screening(s).';
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this screening? This cannot be undone.')) return;
    try {
      await screeningsApi.delete(id);
      await fetchData();
    } catch {
      alert('Failed to delete screening.');
    }
  };

  const toggleActive = async (s: ScreeningData) => {
    try {
      await screeningsApi.update(s.screeningId, { isActive: !s.isActive });
      await fetchData();
    } catch {
      alert('Failed to update status.');
    }
  };

  const formatTime = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' });
  };
  
  const formatDate = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getLocalYMD = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  let filtered = screenings.filter(s => {
    if (searchQuery && !s.movie?.title.toLowerCase().includes(searchQuery.toLowerCase()) && !s.screen?.screenName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterMovie && String(s.movieId) !== filterMovie) return false;
    if (filterScreen && String(s.screenId) !== filterScreen) return false;
    if (filterStatus === 'active' && !s.isActive) return false;
    if (filterStatus === 'inactive' && s.isActive) return false;
    return true;
  });

  const activeCount = screenings.filter(s => s.isActive).length;
  const todayCount = screenings.filter(s => s.date.split('T')[0] === getLocalYMD(new Date())).length;
  const getCapacity = (s: ScreeningData) => s.screen?._count?.seats ?? 0;
  const getBooked = (s: ScreeningData) => s._count?.tickets ?? 0;
  const soldOutCount = screenings.filter(s => getBooked(s) >= getCapacity(s) && getCapacity(s) > 0).length;
  const upcomingScreenings = filtered.filter(s => s.isActive && new Date(s.date) >= new Date(new Date().setHours(0,0,0,0)));
  const highlight = upcomingScreenings.length > 0 ? upcomingScreenings[0] : null;

  // Selected movie for modal to calculate durations
  const selectedMovieInForm = movies.find(m => String(m.movieId) === form.movieId);
  const movieDuration = selectedMovieInForm?.durationMinutes || 0;

  return (
    <div className="admin-screenings-page">
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
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin Avatar" className="admin-avatar" />
        </div>
      </nav>

      <div className="admin-blue-nav">
        <div className="admin-nav-links">
          <Link to="/admin/dashboard">Dashboard</Link>
          <Link to="/admin/movies">Movies</Link>
          <Link to="/admin/screens">Screens</Link>
          <Link to="/admin/seats">Seats</Link>
          <Link to="/admin/screenings" className="active">Screenings</Link>
          <Link to="/admin/bookings">Bookings</Link>
          <Link to="/admin/users">Users</Link>
          <Link to="/admin/profile">Profile</Link>
        </div>
        <button onClick={handleLogoutHome} className="admin-back-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Home
        </button>
      </div>

      <div className="admin-screenings-content">
        
        <div className="screenings-header-section">
          <div className="screenings-header">
            <div className="screenings-header-text">
              <h1>Screenings</h1>
              <p>Schedule and manage movie screenings across your campus screens.</p>
            </div>
            <button className="admin-btn-primary" onClick={openAdd}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Create Screening
            </button>
          </div>
        </div>

        <div className="screenings-status-tabs">
          <button className="status-tab active">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <strong>{screenings.length}</strong> Total
          </button>
          <button className="status-tab">
            <span className="dot green"></span>
            <strong>{activeCount}</strong> Active
          </button>
          <button className="status-tab">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <strong>{todayCount}</strong> Today
          </button>
          <button className="status-tab">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
            <strong>{soldOutCount}</strong> Sold Out
          </button>
        </div>

        <div className="screenings-toolbar">
          <div className="toolbar-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Search by movie or screen..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          
          <div className="toolbar-filters">
            <select className="filter-select" value={filterMovie} onChange={(e) => setFilterMovie(e.target.value)}>
              <option value="">Movie [ All Movies ]</option>
              {movies.map(m => <option key={m.movieId} value={m.movieId}>{m.title}</option>)}
            </select>
            <select className="filter-select" value={filterScreen} onChange={(e) => setFilterScreen(e.target.value)}>
              <option value="">Screen [ All Screens ]</option>
              {screens.map(s => <option key={s.screenId} value={s.screenId}>{s.screenName}</option>)}
            </select>
            <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">Status [ All Status ]</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button className="btn-clear-filters" onClick={() => { setSearchQuery(''); setFilterMovie(''); setFilterScreen(''); setFilterStatus(''); }}>Clear Filters</button>
          </div>
        </div>

        {loading && <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading screenings...</div>}
        
        {!loading && filtered.length === 0 && (
          <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
            No screenings match your criteria.
          </div>
        )}

        {!loading && highlight && (
          <>
            <div className="section-title">
              <h2>Next Highlight</h2>
            </div>
            
            <div className="highlight-card">
              <img src={highlight.movie?.posterUrl || 'https://via.placeholder.com/80x120?text=No+Poster'} alt={highlight.movie?.title} className="highlight-poster" />
              
              <div className="highlight-info">
                <h3>{highlight.movie?.title}</h3>
                <div className="highlight-details">
                  <div className="detail-col">
                    <span className="date">{formatDate(highlight.date)}</span>
                    <span className="time">{formatTime(highlight.startTime)} - {formatTime(highlight.endTime)}</span>
                  </div>
                  <div className="detail-col">
                    <span className="screen-name">{highlight.screen?.screenName}</span>
                    <span className="venue-name">{highlight.screen?.venue}</span>
                  </div>
                  <div className="detail-col price-col">
                    <strong>₹{highlight.price}</strong> / seat
                  </div>
                </div>
              </div>
              
              <div className="highlight-progress-section">
                <div className="progress-header">
                  <span className="booked-text"><strong>{getBooked(highlight)} / {getCapacity(highlight)}</strong> booked</span>
                  <span className="percentage">{getCapacity(highlight) > 0 ? Math.round((getBooked(highlight) / getCapacity(highlight)) * 100) : 0}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${getCapacity(highlight) > 0 ? (getBooked(highlight) / getCapacity(highlight)) * 100 : 0}%` }}></div>
                </div>
                <div className="seats-available-text">{Math.max(0, getCapacity(highlight) - getBooked(highlight))} seats available</div>
              </div>
              
              <div className="highlight-action">
                <button className="btn-manage-highlight" onClick={() => openEdit(highlight)}>Manage Screening</button>
              </div>
            </div>
          </>
        )}

        {!loading && filtered.length > 0 && (
          <>
            <div className="section-title with-action" style={{ marginTop: '40px' }}>
              <h2>All Screenings</h2>
            </div>

            <div className="screenings-table-container">
              <table className="screenings-table">
                <thead>
                  <tr>
                    <th>Movie</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Screen</th>
                    <th>Bookings</th>
                    <th>Capacity</th>
                    <th>Available</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => {
                    const capacity = getCapacity(s);
                    const booked = getBooked(s);
                    const avail = Math.max(0, capacity - booked);
                    return (
                      <tr key={s.screeningId}>
                        <td style={{ fontWeight: 600 }}>{s.movie?.title}</td>
                        <td>{formatDate(s.date)}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>{formatTime(s.startTime)}<br/><span style={{fontSize:'12px', color:'#94a3b8'}}>{formatTime(s.endTime)}</span></td>
                        <td>{s.screen?.screenName}</td>
                        <td>{booked}</td>
                        <td>{capacity}</td>
                        <td style={{ color: avail === 0 ? '#ef4444' : '#10b981', fontWeight: 500 }}>{avail}</td>
                        <td>₹{s.price}</td>
                        <td>
                          {s.isActive ? <span className="status-badge published">Active</span> : <span className="status-badge inactive">Inactive</span>}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn-outline" onClick={() => toggleActive(s)}>
                              {s.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button className="btn-outline edit" style={{ color: '#fff', background: '#1e3a8a', border: '1px solid #1e3a8a' }} onClick={() => openEdit(s)}>Edit</button>
                            <button className="btn-outline" onClick={() => handleDelete(s.screeningId)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Screening' : 'Create Screenings Schedule'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>

            {formError && <div className="modal-error">{formError}</div>}

            <div className="modal-body">
              <div className="modal-row">
                <div className="modal-field">
                  <label>Movie *</label>
                  <select value={form.movieId} onChange={e => setForm(f => ({ ...f, movieId: e.target.value }))}>
                    <option value="">Select a movie...</option>
                    {movies.map(m => <option key={m.movieId} value={m.movieId}>{m.title}</option>)}
                  </select>
                </div>
                <div className="modal-field">
                  <label>Screen *</label>
                  <select value={form.screenId} onChange={e => setForm(f => ({ ...f, screenId: e.target.value }))}>
                    <option value="">Select a screen...</option>
                    {screens.map(s => <option key={s.screenId} value={s.screenId}>{s.screenName} ({s.venue})</option>)}
                  </select>
                </div>
              </div>

              <div className="modal-field">
                <label>Price (₹) *</label>
                <input type="number" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="250" />
              </div>

              {editingId ? (
                /* EDIT MODE: Single Screening */
                <>
                  <div className="modal-row">
                    <div className="modal-field">
                      <label>Date *</label>
                      <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} />
                    </div>
                  </div>
                  <div className="modal-row">
                    <div className="modal-field">
                      <label>Start Time *</label>
                      <input type="time" value={editStartTime} onChange={e => setEditStartTime(e.target.value)} />
                    </div>
                    <div className="modal-field">
                      <label>End Time (Auto)</label>
                      <input type="time" value={calculateEndTime(editStartTime, movieDuration)} disabled style={{ background: '#f8fafc', color: '#94a3b8' }} />
                    </div>
                  </div>
                </>
              ) : (
                /* CREATE MODE: Bulk Screenings */
                <>
                  <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                    <h4 style={{ margin: '0 0 12px', color: '#1e293b', fontSize: '14px' }}>Date Range</h4>
                    <div className="modal-row">
                      <div className="modal-field">
                        <label>Start Date *</label>
                        <input type="date" value={bulkState.startDate} onChange={e => setBulkState(b => ({ ...b, startDate: e.target.value }))} />
                      </div>
                      <div className="modal-field">
                        <label>End Date *</label>
                        <input type="date" value={bulkState.endDate} onChange={e => setBulkState(b => ({ ...b, endDate: e.target.value }))} />
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ margin: '0', color: '#1e293b', fontSize: '14px' }}>Daily Timings</h4>
                      <button 
                        className="btn-outline" 
                        style={{ padding: '4px 12px', fontSize: '12px' }}
                        onClick={() => setBulkState(b => ({ ...b, timings: [...b.timings, ''] }))}
                      >
                        + Add Time
                      </button>
                    </div>

                    {bulkState.timings.map((time, index) => (
                      <div key={index} className="modal-row" style={{ alignItems: 'flex-end', marginBottom: '12px' }}>
                        <div className="modal-field" style={{ marginBottom: 0 }}>
                          <label>Start Time *</label>
                          <input 
                            type="time" 
                            value={time} 
                            onChange={e => {
                              const newTimings = [...bulkState.timings];
                              newTimings[index] = e.target.value;
                              setBulkState(b => ({ ...b, timings: newTimings }));
                            }} 
                          />
                        </div>
                        <div className="modal-field" style={{ marginBottom: 0 }}>
                          <label>End Time (Auto)</label>
                          <input type="time" value={calculateEndTime(time, movieDuration)} disabled style={{ background: '#e2e8f0', color: '#64748b' }} />
                        </div>
                        {bulkState.timings.length > 1 && (
                          <button 
                            className="btn-outline" 
                            style={{ padding: '8px', border: '1px solid #ef4444', color: '#ef4444' }}
                            onClick={() => {
                              const newTimings = bulkState.timings.filter((_, i) => i !== index);
                              setBulkState(b => ({ ...b, timings: newTimings }));
                            }}
                          >
                            &times;
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

            </div>

            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowModal(false)} disabled={saving}>Cancel</button>
              <button className="admin-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : (editingId ? 'Update Screening' : 'Create Schedule')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
