import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogoutHome = () => {
    logout();
    navigate('/');
  };

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Admin Name';

  return (
    <div className="admin-dashboard-page">
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
          <Link to="/admin/dashboard" className="active">Dashboard</Link>
          <Link to="/admin/movies">Movies</Link>
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

      {/* ─── Main Header ──────────────────────────────────────────── */}
      <div className="admin-header-container">
        <div className="admin-header-text">
          <h1>Admin Dashboard</h1>
          <p>Manage films, screenings, seats, bookings, and secure event entry from one place.</p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add Movie
          </button>
          <button className="admin-btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Create Screening
          </button>
        </div>
      </div>

      {/* ─── Grid Content ─────────────────────────────────────────── */}
      <div className="admin-content">
        
        {/* LEFT COLUMN */}
        <div className="admin-left-col">
          {/* Top Stat Cards */}
          <div className="admin-stats-grid">
            <div className="stat-card">
              <div className="stat-card-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>
                Total Movies
              </div>
              <div className="stat-value">25</div>
              <div className="stat-sub positive">↑ 3 added this month</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                Upcoming Screenings
              </div>
              <div className="stat-value">12</div>
              <div className="stat-sub">Next in 2 hours</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                Total Bookings
              </div>
              <div className="stat-value">428</div>
              <div className="stat-sub positive">↑ 12% this week</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                Tickets Scanned
              </div>
              <div className="stat-value">316</div>
              <div className="stat-sub">75% entry rate today</div>
            </div>
          </div>

          {/* Upcoming Screenings Table */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Upcoming Screenings</h2>
              <Link to="/admin/screenings" className="admin-link-blue">
                View All <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </Link>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Movie</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Screen</th>
                  <th>Bookings</th>
                  <th>Availability</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>
                    No upcoming screenings available.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Manage UniPass */}
          <div className="admin-card">
            <h2 className="admin-card-title" style={{ marginBottom: '16px' }}>Manage UniPass</h2>
            <div className="manage-grid">
              <Link to="/admin/movies" className="manage-btn">
                <div className="manage-btn-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg></div>
                <div className="manage-btn-content">
                  <span className="manage-btn-title">Movies</span>
                  <span className="manage-btn-desc">Manage movie information</span>
                </div>
              </Link>
              <Link to="/admin/screens" className="manage-btn">
                <div className="manage-btn-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg></div>
                <div className="manage-btn-content">
                  <span className="manage-btn-title">Screens</span>
                  <span className="manage-btn-desc">Manage physical screens</span>
                </div>
              </Link>
              <Link to="/admin/seats" className="manage-btn">
                <div className="manage-btn-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg></div>
                <div className="manage-btn-content">
                  <span className="manage-btn-title">Seats</span>
                  <span className="manage-btn-desc">Configure layouts</span>
                </div>
              </Link>
              <Link to="/admin/screenings" className="manage-btn">
                <div className="manage-btn-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg></div>
                <div className="manage-btn-content">
                  <span className="manage-btn-title">Screenings</span>
                  <span className="manage-btn-desc">Create and manage</span>
                </div>
              </Link>
              <Link to="/admin/bookings" className="manage-btn">
                <div className="manage-btn-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg></div>
                <div className="manage-btn-content">
                  <span className="manage-btn-title">Bookings</span>
                  <span className="manage-btn-desc">View student details</span>
                </div>
              </Link>
              <Link to="/admin/users" className="manage-btn">
                <div className="manage-btn-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></div>
                <div className="manage-btn-content">
                  <span className="manage-btn-title">Users</span>
                  <span className="manage-btn-desc">Manage accounts</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="admin-right-col">
          {/* Today's Entry Activity */}
          <div className="admin-card">
            <h2 className="admin-card-title" style={{ marginBottom: '16px' }}>Today's Entry Activity</h2>
            <div className="activity-stats">
              <div className="act-stat">
                <span className="label">Tickets Booked</span>
                <span className="value">72</span>
              </div>
              <div className="act-stat">
                <span className="label">Tickets Scanned</span>
                <span className="value">54</span>
              </div>
              <div className="act-stat">
                <span className="label">Remaining Expected</span>
                <span className="value">18</span>
              </div>
              <div className="act-stat">
                <span className="label">Entry Rate</span>
                <span className="value">75%</span>
              </div>
            </div>
            <div className="activity-progress">
              <div className="activity-progress-fill"></div>
            </div>
          </div>

          {/* Seat Availability */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Seat Availability</h2>
              <Link to="/admin/seats" className="admin-link-blue">
                Manage Seats <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </Link>
            </div>
            <div className="seat-avail-item">
              <div className="header">
                <span className="name">Screen 1 (120 seats)</span>
                <span className="info">72 booked, 48 available</span>
              </div>
              <div className="progress-bar-container" style={{ height: '6px' }}>
                <div className="progress-bar-fill" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div className="seat-avail-item">
              <div className="header">
                <span className="name">Screen 2 (100 seats)</span>
                <span className="info">88 booked, 12 available</span>
              </div>
              <div className="progress-bar-container" style={{ height: '6px' }}>
                <div className="progress-bar-fill" style={{ width: '88%' }}></div>
              </div>
            </div>
          </div>

          {/* Publishing Status */}
          <div className="admin-card">
            <h2 className="admin-card-title" style={{ marginBottom: '16px' }}>Publishing Status</h2>
            <div className="pub-grid">
              <div style={{ color: '#64748b', padding: '16px' }}>No movies published yet.</div>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Recent Bookings</h2>
              <Link to="/admin/bookings" className="admin-link-blue">
                View All Bookings <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </Link>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Student</th>
                  <th>Movie</th>
                  <th>Screening</th>
                  <th>Seat</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>
                    No recent bookings.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
