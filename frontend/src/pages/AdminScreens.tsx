import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { screensApi } from '../services/api.client';
import './AdminScreens.css';

interface ScreenData {
  screenId: number;
  screenName: string;
  venue: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  _count?: { seats: number; screenings: number };
}

const EMPTY_FORM = {
  screenName: '',
  venue: '',
  description: '',
  isActive: true,
};

export default function AdminScreens() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [screens, setScreens] = useState<ScreenData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const handleLogoutHome = () => {
    logout();
    navigate('/');
  };

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Admin Name';

  // ─── Fetch screens ──────────────────────────────────────────────
  const fetchScreens = async () => {
    try {
      const res = await screensApi.getAll();
      setScreens(res.data?.data ?? []);
    } catch {
      console.error('Failed to fetch screens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScreens();
  }, []);

  // ─── Open modal for Add ─────────────────────────────────────────
  const openAdd = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setFormError('');
    setShowModal(true);
  };

  // ─── Open modal for Edit ────────────────────────────────────────
  const openEdit = (screen: ScreenData) => {
    setEditingId(screen.screenId);
    setForm({
      screenName: screen.screenName,
      venue: screen.venue,
      description: screen.description,
      isActive: screen.isActive,
    });
    setFormError('');
    setShowModal(true);
  };

  // ─── Save ───────────────────────────────────────────────────────
  const handleSave = async () => {
    setFormError('');
    if (!form.screenName || !form.venue || !form.description) {
      setFormError('All fields are required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        screenName: form.screenName,
        venue: form.venue,
        description: form.description,
        isActive: form.isActive,
      };
      if (editingId) {
        await screensApi.update(editingId, payload);
      } else {
        await screensApi.create(payload);
      }
      setShowModal(false);
      await fetchScreens();
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message ?? 'Failed to save screen.';
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete ─────────────────────────────────────────────────────
  const handleDelete = async (screenId: number, screenName: string) => {
    if (!window.confirm(`Delete "${screenName}"? This cannot be undone.`)) return;
    try {
      await screensApi.delete(screenId);
      await fetchScreens();
    } catch {
      alert('Failed to delete screen.');
    }
  };

  // ─── Toggle active ──────────────────────────────────────────────
  const toggleActive = async (screen: ScreenData) => {
    try {
      await screensApi.update(screen.screenId, { isActive: !screen.isActive });
      await fetchScreens();
    } catch {
      alert('Failed to update status.');
    }
  };

  const filtered = screens.filter(s =>
    s.screenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.venue.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const activeCount = screens.filter(s => s.isActive).length;
  const inactiveCount = screens.filter(s => !s.isActive).length;

  const AuditoriumIcon = () => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="screen-card-icon">
      <rect x="14" y="14" width="36" height="20" fill="white" stroke="#1e293b" strokeWidth="2" />
      <polygon points="14,14 4,10 4,34 14,34" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round" />
      <polygon points="50,14 60,10 60,34 50,34" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round" />
      <rect x="18" y="18" width="28" height="12" fill="#e2e8f0" />
      <rect x="14" y="38" width="6" height="5" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>
      <rect x="22" y="38" width="6" height="5" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>
      <rect x="30" y="38" width="6" height="5" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>
      <rect x="38" y="38" width="6" height="5" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>
      <rect x="46" y="38" width="6" height="5" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>
      <rect x="12" y="45" width="6" height="5" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>
      <rect x="21" y="45" width="6" height="5" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>
      <rect x="30" y="45" width="6" height="5" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>
      <rect x="39" y="45" width="6" height="5" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>
      <rect x="48" y="45" width="6" height="5" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>
      <rect x="10" y="52" width="7" height="6" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>
      <rect x="19" y="52" width="7" height="6" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>
      <rect x="29" y="52" width="7" height="6" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>
      <rect x="39" y="52" width="7" height="6" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>
      <rect x="48" y="52" width="7" height="6" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>
    </svg>
  );

  return (
    <div className="admin-screens-page">
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
          <Link to="/admin/movies">Movies</Link>
          <Link to="/admin/screens" className="active">Screens</Link>
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

      <div className="admin-screens-content">
        {/* ─── Header ────────────────────────────────────────────── */}
        <div className="screens-header">
          <div className="screens-header-text">
            <h1>Screens</h1>
            <p>Manage physical screens, venues, and their seat configurations.</p>
          </div>
          <button className="admin-btn-primary" onClick={openAdd}>
            + Add Screen
          </button>
        </div>

        {/* ─── Toolbar (Search & Filters) ────────────────────────── */}
        <div className="screens-toolbar">
          <div className="toolbar-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              placeholder="Search screens..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* ─── Summary ───────────────────────────────────────────── */}
        <div className="screens-summary">
          <strong>{screens.length} Total Screens</strong> - <span className="active-text">{activeCount} Active</span> - <span className="inactive-text">{inactiveCount} Inactive</span>
        </div>

        {/* ─── Loading ────────────────────────────────────────── */}
        {loading && <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Loading screens...</div>}

        {/* ─── Empty ──────────────────────────────────────────── */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
            {searchQuery ? 'No screens match your search.' : 'No screens added yet. Click "+ Add Screen" to create one.'}
          </div>
        )}

        {/* ─── Grid View ─────────────────────────────────────────── */}
        {!loading && filtered.length > 0 && (
          <div className="screens-grid">
            {filtered.map((screen) => (
              <div key={screen.screenId} className="screen-card">
                <div className="screen-card-header">
                  <div className="screen-icon-wrapper">
                    <AuditoriumIcon />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 4px', fontSize: '18px', color: '#0f172a' }}>{screen.screenName}</h3>
                    <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#64748b' }}>{screen.venue}</p>
                    {screen.isActive ? (
                      <span className="status-badge published">Active</span>
                    ) : (
                      <span className="status-badge inactive">Inactive</span>
                    )}
                  </div>
                </div>
                
                <div className="screen-card-stats" style={{ display: 'flex', gap: '16px', margin: '16px 0', fontSize: '13px', color: '#475569' }}>
                  <div><strong>{screen._count?.seats ?? 0}</strong> Seats</div>
                  <div><strong>{screen._count?.screenings ?? 0}</strong> Screenings</div>
                </div>

                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px', flex: 1 }}>
                  {screen.description}
                </div>

                <div className="screen-card-actions" style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                  <button className="btn-outline" onClick={() => toggleActive(screen)}>
                    {screen.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button className="btn-outline edit" style={{ color: '#fff', background: '#1e3a8a', border: '1px solid #1e3a8a' }} onClick={() => openEdit(screen)}>Edit</button>
                  <button className="btn-outline" onClick={() => handleDelete(screen.screenId, screen.screenName)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ─── Add / Edit Modal ───────────────────────────────────── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Screen' : 'Add New Screen'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>

            {formError && <div className="modal-error">{formError}</div>}

            <div className="modal-body">
              <div className="modal-field">
                <label>Screen Name *</label>
                <input type="text" value={form.screenName} onChange={e => setForm(f => ({ ...f, screenName: e.target.value }))} placeholder="e.g. Auditorium 1" />
              </div>
              <div className="modal-field">
                <label>Venue *</label>
                <input type="text" value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} placeholder="e.g. Main Campus" />
              </div>
              <div className="modal-field">
                <label>Description *</label>
                <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description of the screen..." />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowModal(false)} disabled={saving}>Cancel</button>
              <button className="admin-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Screen'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
