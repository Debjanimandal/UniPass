import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import './AdminProfile.css';

export default function AdminProfile() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogoutHome = () => {
    logout();
    navigate('/');
  };

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Admin Name';
  const email = user?.email || 'admin@unipass.com';
  const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : 'A';

  return (
    <div className="admin-profile-page">
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
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName}`}
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
          <Link to="/admin/users">Users</Link>
          <Link to="/admin/profile" className="active">Profile</Link>
        </div>
        <button onClick={handleLogoutHome} className="admin-back-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Home
        </button>
      </div>

      <div className="admin-profile-content">
        
        {/* ─── Header ────────────────────────────────────────────── */}
        <div className="profile-header-section">
          <div className="profile-header-text">
            <h1>Admin Profile</h1>
            <p>Manage your administrator account, security settings, and UniPass activity.</p>
          </div>
        </div>

        {/* ─── Main Content Layout ───────────────────────────────── */}
        <div className="profile-layout">
          
          {/* Left Column: Profile Card */}
          <div className="profile-card">
            <div className="profile-card-banner"></div>
            <div className="profile-card-avatar">
              <div className="avatar-circle">{initials}</div>
            </div>
            
            <div className="profile-card-info">
              <h2>{fullName}</h2>
              <p className="email">{email}</p>
              
              <div className="profile-status-list">
                <div className="status-row">
                  <span className="label">Role:</span>
                  <span className="value text-blue">ADMIN</span>
                </div>
                <div className="status-row">
                  <span className="label">Status:</span>
                  <span className="value text-green">
                    <span className="dot green"></span> Active
                  </span>
                </div>
                <div className="status-row">
                  <span className="label">Member Since:</span>
                  <span className="value text-dark">September 2026</span>
                </div>
              </div>
              
              <div className="role-pill-full">Administrator Account</div>
            </div>
            
            <div className="profile-card-footer">
              <button className="btn-edit-profile">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                Edit Profile
              </button>
            </div>
          </div>
          
          {/* Right Area: Masonry Grid */}
          <div className="profile-grid">
            
            {/* Grid Column 1 */}
            <div className="grid-col">
              <div className="info-card">
                <h3>Personal Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>First Name</label>
                    <input type="text" value={user?.firstName || 'Admin'} readOnly />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input type="text" value={user?.lastName || 'User'} readOnly />
                  </div>
                  <div className="form-group full-width">
                    <label>Email Address</label>
                    <input type="email" value={email} readOnly />
                  </div>
                  <div className="form-group full-width">
                    <label>Phone Number</label>
                    <input type="text" value="+91 98765 43210" readOnly />
                  </div>
                </div>
                <button className="btn-save-changes">Save Changes</button>
              </div>
              
              <div className="info-card">
                <h3>Recent Administrative Activity</h3>
                <div className="activity-list">
                  <div style={{ color: '#64748b', padding: '16px' }}>No recent activity.</div>
                </div>
              </div>
            </div>
            
            {/* Grid Column 2 */}
            <div className="grid-col">
              <div className="info-card">
                <h3>Account Information</h3>
                <div className="stats-list">
                  <div className="stat-row">
                    <span className="label">Role</span>
                    <span className="value">Administrator</span>
                  </div>
                  <div className="stat-row">
                    <span className="label">Account Status</span>
                    <span className="value">Active</span>
                  </div>
                  <div className="stat-row">
                    <span className="label">Email Verification</span>
                    <span className="value">Verified</span>
                  </div>
                  <div className="stat-row">
                    <span className="label">Member Since</span>
                    <span className="value">September 2026</span>
                  </div>
                  <div className="stat-row">
                    <span className="label">Last Login</span>
                    <span className="value">Today · 09:42 PM</span>
                  </div>
                </div>
              </div>
              
              <div className="info-card">
                <h3>Security</h3>
                <div className="security-item">
                  <div className="security-info">
                    <strong>Password</strong>
                    <span>Last updated recently</span>
                  </div>
                  <button className="btn-outline">Change Password</button>
                </div>
                <div className="security-item">
                  <div className="security-info">
                    <strong>Two-Factor Authentication</strong>
                    <span>Enabled</span>
                  </div>
                  <div className="toggle-switch active">
                    <span className="toggle-label">Enabled</span>
                    <div className="toggle-knob"></div>
                  </div>
                </div>
                <div className="security-item borderless">
                  <div className="security-info">
                    <strong>Active Sessions</strong>
                    <span>2 sessions</span>
                  </div>
                  <Link to="#" className="text-link">Manage Sessions</Link>
                </div>
              </div>
            </div>
            
            {/* Grid Column 3 */}
            <div className="grid-col">
              <div className="info-card">
                <h3>My Administration Overview</h3>
                <div className="overview-grid">
                  <div className="overview-item">
                    <div className="overview-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg></div>
                    <div className="overview-stats">
                      <span>Movies Managed</span>
                      <strong>25</strong>
                    </div>
                  </div>
                  <div className="overview-item">
                    <div className="overview-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></div>
                    <div className="overview-stats">
                      <span>Screenings Managed</span>
                      <strong>12</strong>
                    </div>
                  </div>
                  <div className="overview-item">
                    <div className="overview-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></div>
                    <div className="overview-stats">
                      <span>Bookings Monitored</span>
                      <strong>428</strong>
                    </div>
                  </div>
                  <div className="overview-item">
                    <div className="overview-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></div>
                    <div className="overview-stats">
                      <span>Users Managed</span>
                      <strong>1,248</strong>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="info-card">
                <h3>Quick Access</h3>
                <div className="quick-access-list">
                  <div className="qa-item">
                    <div className="qa-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line></svg></div>
                    <div className="qa-text">
                      <strong>Manage Movies</strong>
                      <span>Add, edit, publish and manage films.</span>
                    </div>
                  </div>
                  <div className="qa-item">
                    <div className="qa-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line></svg></div>
                    <div className="qa-text">
                      <strong>Manage Screenings</strong>
                      <span>Schedule and publish screenings.</span>
                    </div>
                  </div>
                  <div className="qa-item">
                    <div className="qa-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg></div>
                    <div className="qa-text">
                      <strong>Manage Seats</strong>
                      <span>Configure screen-wise seat layouts.</span>
                    </div>
                  </div>
                  <div className="qa-item">
                    <div className="qa-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg></div>
                    <div className="qa-text">
                      <strong>View Bookings</strong>
                      <span>Review student reservations and ticket status.</span>
                    </div>
                  </div>
                  <div className="qa-item">
                    <div className="qa-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></div>
                    <div className="qa-text">
                      <strong>Manage Users</strong>
                      <span>Manage students, guards and administrators.</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="info-card">
                <h3>Administrator Access</h3>
                <div className="access-grid">
                  <div className="access-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Manage Movies</div>
                  <div className="access-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Manage Screens</div>
                  <div className="access-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Manage Seats</div>
                  <div className="access-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Manage Screenings</div>
                  <div className="access-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> View Bookings</div>
                  <div className="access-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Manage Users</div>
                  <div className="access-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> View Entry Activity</div>
                </div>
              </div>
              
              <div className="info-card">
                <h3>Account Actions</h3>
                <div className="account-actions">
                  <button onClick={logout} className="btn-logout">Log Out</button>
                  <Link to="#" className="text-link">Sign out of all devices</Link>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
