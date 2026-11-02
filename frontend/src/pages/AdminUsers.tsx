import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { usersApi } from '../services/api.client';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import './AdminUsers.css';

interface ApiUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'STUDENT' | 'GUARD' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  bookings: number;
}

interface UserStats {
  total: number;
  students: number;
  guards: number;
  admins: number;
  active: number;
  inactive: number;
}

interface UserDetail extends ApiUser {
  upcomingTickets: number;
  completedEvents: number;
}

const EMPTY_STATS: UserStats = { total: 0, students: 0, guards: 0, admins: 0, active: 0, inactive: 0 };

const EMPTY_ADD_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  role: 'STUDENT' as 'STUDENT' | 'GUARD' | 'ADMIN',
};

const AVATAR_COLORS = ['blue', 'pink', 'yellow', 'orange'];

function formatJoined(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function initialsOf(u: ApiUser): string {
  return `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase() || '?';
}

export default function AdminUsers() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [users, setUsers] = useState<ApiUser[]>([]);
  const [stats, setStats] = useState<UserStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Add-user modal
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ ...EMPTY_ADD_FORM });
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState('');

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Admin Name';

  const fetchUsers = useCallback(async () => {
    try {
      setError('');
      const res = await usersApi.getAll();
      const data = res.data?.data;
      setUsers(data?.users ?? []);
      setStats(data?.stats ?? EMPTY_STATS);
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message ?? 'Failed to load users.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useAutoRefresh(fetchUsers);

  const handleLogoutHome = () => { logout(); navigate('/'); };

  const openDetail = async (u: ApiUser) => {
    setDetailLoading(true);
    // Show what we already have immediately, then enrich with ticket counts.
    setSelectedUser({ ...u, upcomingTickets: 0, completedEvents: 0 });
    try {
      const res = await usersApi.getById(u.id);
      if (res.data?.data) setSelectedUser(res.data.data);
    } catch {
      /* keep the basic view if detail fetch fails */
    } finally {
      setDetailLoading(false);
    }
  };

  const toggleActive = async (u: ApiUser) => {
    try {
      await usersApi.update(u.id, { isActive: !u.isActive });
      await fetchUsers();
      if (selectedUser?.id === u.id) {
        setSelectedUser(prev => prev ? { ...prev, isActive: !u.isActive } : prev);
      }
    } catch (err: any) {
      alert(err?.response?.data?.error?.message ?? 'Failed to update user status.');
    }
  };

  const changeRole = async (u: ApiUser, role: 'STUDENT' | 'GUARD' | 'ADMIN') => {
    try {
      await usersApi.update(u.id, { role });
      await fetchUsers();
      if (selectedUser?.id === u.id) {
        setSelectedUser(prev => prev ? { ...prev, role } : prev);
      }
    } catch (err: any) {
      alert(err?.response?.data?.error?.message ?? 'Failed to update role.');
    }
  };

  const openAdd = () => {
    setAddForm({ ...EMPTY_ADD_FORM });
    setAddError('');
    setShowAdd(true);
  };

  const handleAddUser = async () => {
    setAddError('');
    if (!addForm.firstName || !addForm.lastName || !addForm.email || !addForm.phone || !addForm.password) {
      setAddError('All fields are required.');
      return;
    }
    if (addForm.password.length < 8) {
      setAddError('Password must be at least 8 characters.');
      return;
    }
    setSaving(true);
    try {
      await usersApi.create(addForm);
      setShowAdd(false);
      await fetchUsers();
    } catch (err: any) {
      setAddError(err?.response?.data?.error?.message ?? 'Failed to create user.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Client-side filtering on the real data ────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter(u => {
      const name = `${u.firstName} ${u.lastName}`.toLowerCase();
      if (q && !name.includes(q) && !u.email.toLowerCase().includes(q)) return false;
      if (roleFilter && u.role !== roleFilter) return false;
      if (statusFilter === 'active' && !u.isActive) return false;
      if (statusFilter === 'inactive' && u.isActive) return false;
      return true;
    });
  }, [users, search, roleFilter, statusFilter]);

  const clearFilters = () => { setSearch(''); setRoleFilter(''); setStatusFilter(''); };

  return (
    <div className="admin-users-page">
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
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`}
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
          <Link to="/admin/screens">Screens</Link>
          <Link to="/admin/seats">Seats</Link>
          <Link to="/admin/screenings">Screenings</Link>
          <Link to="/admin/bookings">Bookings</Link>
          <Link to="/admin/users" className="active">Users</Link>
          <Link to="/admin/profile">Profile</Link>
        </div>
        <button onClick={handleLogoutHome} className="admin-back-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Home
        </button>
      </div>

      <div className="admin-users-content">

        {/* ─── Header ────────────────────────────────────────────── */}
        <div className="users-header-section">
          <div className="users-header">
            <div className="users-header-text">
              <h1>Users</h1>
              <p>Manage students, guards, and administrators across UniPass.</p>
            </div>
            <button className="admin-btn-primary" onClick={openAdd}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add User
            </button>
          </div>
        </div>

        {/* ─── Stats Bar (real counts) ───────────────────────────── */}
        <div className="users-stats-bar">
          <div className="stat-segment">
            <div className="stat-info">
              <span className="stat-label">Total Users</span>
              <span className="stat-value">{stats.total.toLocaleString()}</span>
            </div>
            <div className="stat-icon-wrapper light-blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
          </div>

          <div className="stat-divider"></div>

          <div className="stat-segment">
            <div className="stat-info">
              <span className="stat-label">Students</span>
              <span className="stat-value">{stats.students.toLocaleString()}</span>
            </div>
            <div className="stat-icon-wrapper light-blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
            </div>
          </div>

          <div className="stat-divider"></div>

          <div className="stat-segment">
            <div className="stat-info">
              <span className="stat-label">Guards</span>
              <span className="stat-value">{stats.guards.toLocaleString()}</span>
            </div>
            <div className="stat-icon-wrapper light-brown">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
          </div>

          <div className="stat-divider"></div>

          <div className="stat-segment">
            <div className="stat-info">
              <span className="stat-label">Admins</span>
              <span className="stat-value">{stats.admins.toLocaleString()}</span>
            </div>
            <div className="stat-icon-wrapper light-blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
          </div>
        </div>

        {/* ─── Toolbar (Search & Filters) ────────────────────────── */}
        <div className="users-toolbar">
          <div className="toolbar-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="toolbar-filters">
            <div className="filter-group">
              <span className="filter-label">Role</span>
              <select className="filter-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="">All Roles</option>
                <option value="STUDENT">Student</option>
                <option value="GUARD">Guard</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="filter-group">
              <span className="filter-label">Status</span>
              <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <button className="btn-clear-filters" onClick={clearFilters}>Clear Filters</button>
          </div>
        </div>

        {/* ─── Main Content Layout ───────────────────────────────── */}
        <div className="users-main-layout">

          {/* Left: Table Section */}
          <div className="users-table-section">
            <div className="table-header">
              <h2>All Users</h2>
              <span className="subtitle">{filtered.length} of {users.length} users</span>
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading users...</div>
            ) : error ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#dc2626' }}>{error}</div>
            ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Bookings</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, idx) => (
                    <tr
                      key={u.id}
                      className={selectedUser?.id === u.id ? 'selected-row' : ''}
                      onClick={() => openDetail(u)}
                    >
                      <td className="user-cell">
                        <div className={`user-avatar-initials bg-${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                          {initialsOf(u)}
                        </div>
                        <span className="fw-600">{u.firstName} {u.lastName}</span>
                      </td>
                      <td>{u.email}</td>
                      <td>{u.phone}</td>
                      <td>
                        <span className={`role-pill role-${u.role.toLowerCase()}`}>{u.role}</span>
                      </td>
                      <td>
                        <div className="status-indicator">
                          <span className={`dot ${u.isActive ? 'green' : 'red'}`}></span>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </td>
                      <td>{formatJoined(u.createdAt)}</td>
                      <td>{u.role === 'STUDENT' ? `${u.bookings} booking${u.bookings === 1 ? '' : 's'}` : '—'}</td>
                      <td>
                        <button
                          className="btn-view-outline"
                          onClick={(e) => { e.stopPropagation(); openDetail(u); }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                        No users match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            <div className="table-footer">
              <span className="showing-text">
                Showing {filtered.length} of {users.length} users
              </span>
            </div>
          </div>

          {/* Right: Details Section (real data) */}
          <div className="user-details-section">
            <div className="details-header">User Details</div>

            {selectedUser ? (
              <div className="details-content">
                <div className="details-profile-card">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(selectedUser.firstName + selectedUser.lastName)}`}
                    alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                    className="details-avatar"
                  />
                  <div className="details-profile-info">
                    <h3>{selectedUser.firstName} {selectedUser.lastName}</h3>
                    <p>{selectedUser.email}</p>
                    <p>{selectedUser.phone}</p>
                  </div>
                </div>

                <div className="details-stats-list">
                  <div className="details-stat-row">
                    <span className="label">Role:</span>
                    <span className={`value role-text-${selectedUser.role.toLowerCase()}`}>{selectedUser.role}</span>
                  </div>
                  <div className="details-stat-row">
                    <span className="label">Status:</span>
                    <span className={selectedUser.isActive ? 'value status-text-active' : 'value status-text-inactive'}>
                      {selectedUser.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <div className="details-stat-row">
                    <span className="label">Member Since:</span>
                    <span className="value">{formatJoined(selectedUser.createdAt)}</span>
                  </div>
                  <div className="details-stat-row">
                    <span className="label">Bookings:</span>
                    <span className="value">{selectedUser.bookings}</span>
                  </div>
                  <div className="details-stat-row">
                    <span className="label">Upcoming Tickets:</span>
                    <span className="value">{detailLoading ? '…' : selectedUser.upcomingTickets}</span>
                  </div>
                  <div className="details-stat-row">
                    <span className="label">Completed Events:</span>
                    <span className="value">{detailLoading ? '…' : selectedUser.completedEvents}</span>
                  </div>
                </div>

                <div className="details-actions">
                  <div className="actions-row">
                    <label style={{ fontSize: '13px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                      Change Role
                      <select
                        className="filter-select"
                        value={selectedUser.role}
                        onChange={(e) => changeRole(selectedUser, e.target.value as 'STUDENT' | 'GUARD' | 'ADMIN')}
                      >
                        <option value="STUDENT">Student</option>
                        <option value="GUARD">Guard</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </label>
                  </div>
                  <button
                    className="btn-edit-user"
                    onClick={() => toggleActive(selectedUser)}
                    style={selectedUser.isActive
                      ? { background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3' }
                      : { background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' }}
                  >
                    {selectedUser.isActive ? 'Deactivate User' : 'Activate User'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="no-user-selected">Select a user to view details</div>
            )}
          </div>

        </div>
      </div>

      {/* ─── Add User Modal ─────────────────────────────────────── */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2>Add User</h2>
              <button className="modal-close" onClick={() => setShowAdd(false)}>&times;</button>
            </div>

            {addError && <div className="modal-error">{addError}</div>}

            <div className="modal-body">
              <div className="modal-row">
                <div className="modal-field">
                  <label>First Name *</label>
                  <input value={addForm.firstName} onChange={e => setAddForm(f => ({ ...f, firstName: e.target.value }))} />
                </div>
                <div className="modal-field">
                  <label>Last Name *</label>
                  <input value={addForm.lastName} onChange={e => setAddForm(f => ({ ...f, lastName: e.target.value }))} />
                </div>
              </div>
              <div className="modal-field">
                <label>Email *</label>
                <input type="email" value={addForm.email} onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="modal-field">
                <label>Phone *</label>
                <input value={addForm.phone} onChange={e => setAddForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="modal-row">
                <div className="modal-field">
                  <label>Password * (min 8 chars)</label>
                  <input type="password" value={addForm.password} onChange={e => setAddForm(f => ({ ...f, password: e.target.value }))} />
                </div>
                <div className="modal-field">
                  <label>Role *</label>
                  <select value={addForm.role} onChange={e => setAddForm(f => ({ ...f, role: e.target.value as 'STUDENT' | 'GUARD' | 'ADMIN' }))}>
                    <option value="STUDENT">Student</option>
                    <option value="GUARD">Guard</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowAdd(false)} disabled={saving}>Cancel</button>
              <button className="admin-btn-primary" onClick={handleAddUser} disabled={saving}>
                {saving ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
