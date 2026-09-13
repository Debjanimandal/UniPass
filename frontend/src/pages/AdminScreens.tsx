import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import './AdminScreens.css';

export default function AdminScreens() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogoutHome = () => {
    logout();
    navigate('/');
  };

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Admin Name';

  const screens = [
    {
      id: 1,
      name: 'Screen 1: Main Auditorium',
      venue: 'University Auditorium',
      seats: 120,
      upcoming: 4,
      status: 'Active',
      time: 'Today'
    },
    {
      id: 2,
      name: 'Screen 2: Innovation Hall',
      venue: 'Innovation Building',
      seats: 100,
      upcoming: 3,
      status: 'Active',
      time: 'Today'
    },
    {
      id: 3,
      name: 'Screen 3: Open Air Screen',
      venue: 'Campus Amphitheatre',
      seats: 80,
      upcoming: 1,
      status: 'Active',
      time: 'Today'
    }
  ];

  const AuditoriumIcon = () => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="screen-card-icon">
      {/* Screen Outline */}
      <rect x="14" y="14" width="36" height="20" fill="white" stroke="#1e293b" strokeWidth="2" />
      {/* Left blue curtain/panel */}
      <polygon points="14,14 4,10 4,34 14,34" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round" />
      {/* Right blue curtain/panel */}
      <polygon points="50,14 60,10 60,34 50,34" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round" />
      {/* Inner Screen Area */}
      <rect x="18" y="18" width="28" height="12" fill="#e2e8f0" />
      
      {/* Seating Row 1 (back) */}
      <rect x="14" y="38" width="6" height="5" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>
      <rect x="22" y="38" width="6" height="5" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>
      <rect x="30" y="38" width="6" height="5" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>
      <rect x="38" y="38" width="6" height="5" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>
      <rect x="46" y="38" width="6" height="5" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>
      
      {/* Seating Row 2 */}
      <rect x="12" y="45" width="6" height="5" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>
      <rect x="21" y="45" width="6" height="5" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>
      <rect x="30" y="45" width="6" height="5" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>
      <rect x="39" y="45" width="6" height="5" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>
      <rect x="48" y="45" width="6" height="5" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>

      {/* Seating Row 3 (front) */}
      <rect x="10" y="52" width="7" height="6" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>
      <rect x="19" y="52" width="7" height="6" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>
      <rect x="29" y="52" width="7" height="6" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>
      <rect x="39" y="52" width="7" height="6" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>
      <rect x="48" y="52" width="7" height="6" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>
    </svg>
  );

  const OpenAirIcon = () => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="screen-card-icon">
      {/* Screen Outline */}
      <rect x="16" y="14" width="32" height="20" fill="white" stroke="#1e293b" strokeWidth="2" />
      {/* Inner Screen Area */}
      <rect x="20" y="18" width="24" height="12" fill="#e2e8f0" />
      
      {/* Left Truss/Scaffolding */}
      <rect x="6" y="10" width="10" height="24" fill="#f8fafc" stroke="#1e293b" strokeWidth="2" />
      <path d="M6 10L16 22 M6 22L16 10 M6 22L16 34 M6 34L16 22" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      
      {/* Right Truss/Scaffolding */}
      <rect x="48" y="10" width="10" height="24" fill="#f8fafc" stroke="#1e293b" strokeWidth="2" />
      <path d="M48 10L58 22 M48 22L58 10 M48 22L58 34 M48 34L58 22" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      
      {/* Seating Row 1 (back) */}
      <rect x="14" y="38" width="6" height="5" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>
      <rect x="22" y="38" width="6" height="5" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>
      <rect x="30" y="38" width="6" height="5" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>
      <rect x="38" y="38" width="6" height="5" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>
      <rect x="46" y="38" width="6" height="5" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>
      
      {/* Seating Row 2 */}
      <rect x="12" y="45" width="6" height="5" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>
      <rect x="21" y="45" width="6" height="5" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>
      <rect x="30" y="45" width="6" height="5" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>
      <rect x="39" y="45" width="6" height="5" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>
      <rect x="48" y="45" width="6" height="5" fill="#3b82f6" stroke="#1e293b" strokeWidth="2" rx="1"/>

      {/* Seating Row 3 (front) */}
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
          <button className="admin-btn-primary">
            + Add Screen
          </button>
        </div>

        {/* ─── Toolbar (Search & Filters) ────────────────────────── */}
        <div className="screens-toolbar">
          <div className="toolbar-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Search screens..." />
          </div>
          
          <div className="toolbar-filter">
            <div className="admin-filter-group">
              <span className="label">Status</span>
              <select><option>All Status</option></select>
            </div>
            <div className="admin-filter-group">
              <span className="label">Venue</span>
              <select><option>All Venues</option></select>
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
        <div className="screens-summary">
          <strong>3 Total Screens</strong> - <span className="active-text">3 Active</span> - <span className="inactive-text">0 Inactive</span>
        </div>

        {/* ─── Grid View ─────────────────────────────────────────── */}
        <div className="screens-grid">
          {screens.map(screen => (
            <div key={screen.id} className="screen-card">
              <div className="screen-card-header">
                <div className="screen-icon-wrapper">
                  {screen.id === 3 ? <OpenAirIcon /> : <AuditoriumIcon />}
                </div>
                <div className="screen-title-area">
                  <h3>{screen.name}</h3>
                  <p>Venue: {screen.venue}</p>
                </div>
              </div>
              
              <div className="screen-card-stats">
                <div className="stat-col">
                  <strong>{screen.seats}</strong> Seats
                </div>
                <div className="stat-col">
                  <strong>{screen.upcoming}</strong> Upcoming Screenings
                </div>
              </div>
              
              <div className="screen-card-status">
                <span className="status-badge active">Active</span>
              </div>
              
              <div className="screen-card-actions">
                <button className="btn-manage-seats">Manage Seats</button>
                <button className="btn-edit">Edit</button>
                <button className="btn-more">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ─── Table View ────────────────────────────────────────── */}
        <div className="screens-table-container">
          <table className="screens-table">
            <thead>
              <tr>
                <th>Screen name</th>
                <th>Venue</th>
                <th>Seats</th>
                <th>Upcoming</th>
                <th>Status</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {screens.map(screen => (
                <tr key={screen.id}>
                  <td className="fw-600">{screen.name}</td>
                  <td>{screen.venue}</td>
                  <td>{screen.seats}</td>
                  <td>{screen.upcoming}</td>
                  <td><span className="status-badge active">{screen.status}</span></td>
                  <td>{screen.time}</td>
                  <td className="actions-cell">
                    <button className="btn-manage-outline">Manage</button>
                    <button className="btn-more-outline">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
