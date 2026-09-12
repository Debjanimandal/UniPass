import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import './Profile.css';

export default function Profile() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogoutHome = () => {
    logout();
    navigate('/');
  };

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Student Name';
  const email = user ? user.email : 'student@example.com';
  const phone = user ? user.phone : '+91 98765 43210';
  const firstName = user ? user.firstName : 'Debraj';
  const lastName = user ? user.lastName : 'Name';

  return (
    <div className="profile-page">
      {/* ─── Top Navbar ─────────────────────────────────────────── */}
      <nav className="profile-top-nav">
        <Link to="/" className="profile-logo-container">
          <img src="/logo.png" alt="UniPass Logo" />
          <span className="profile-logo-text">UniPass</span>
        </Link>
        <div className="profile-user-info">
          <span>Welcome, {fullName}!</span>
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
            alt="User Avatar"
            className="profile-avatar"
          />
        </div>
      </nav>

      {/* ─── Blue Secondary Nav ───────────────────────────────────── */}
      <div className="profile-blue-nav">
        <Link to="/student/dashboard">Dashboard</Link>
        <Link to="/student/bookings">Bookings</Link>
        <Link to="/student/events">Events</Link>
        <Link to="/student/films">Films</Link>
        <Link to="/student/profile" className="active">Profile</Link>
      </div>

      {/* ─── Main Content Header ──────────────────────────────────── */}
      <div className="profile-header-container">
        <h1>My Profile</h1>
        <p>Manage your UniPass account and personal information.</p>
      </div>

      {/* ─── Profile Content Grid ─────────────────────────────────── */}
      <div className="profile-content">
        
        {/* LEFT COLUMN */}
        <div className="profile-left-column">
          {/* User Info Card */}
          <div className="profile-card user-info-card">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
              alt="User Avatar"
              className="user-avatar-large"
            />
            <h3>{fullName}</h3>
            <p className="email">{email}</p>
            <p className="role">Student Account</p>
            <p className="status">Active</p>
            <p className="member-since">Member since September 2026</p>
            <button className="edit-profile-btn">Edit Profile</button>
          </div>

          {/* Booking Overview Card */}
          <div className="profile-card">
            <h2>Booking Overview</h2>
            <div className="booking-stats">
              <div className="stat-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"></path></svg>
                <span className="label">Total<br/>Bookings:</span>
                <span className="value">6</span>
              </div>
              <div className="stat-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="8" width="18" height="12" rx="2"></rect><path d="M7 8V6a2 2 0 012-2h6a2 2 0 012 2v2"></path></svg>
                <span className="label">Upcoming<br/>Tickets:</span>
                <span className="value">1</span>
              </div>
              <div className="stat-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                <span className="label">Completed<br/>Events:</span>
                <span className="value">5</span>
              </div>
            </div>
          </div>

          {/* Quick Links Card */}
          <div className="profile-card">
            <h2>Quick Links</h2>
            <div className="quick-links-grid">
              <Link to="/student/tickets" className="quick-link">My Tickets</Link>
              <Link to="/student/bookings" className="quick-link">My Bookings</Link>
              <Link to="/student/films" className="quick-link">Browse Films</Link>
              <Link to="/student/events" className="quick-link">Browse Events</Link>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="profile-right-column">
          {/* Personal Information */}
          <div className="profile-card">
            <h2>Personal Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>First Name</label>
                <input type="text" className="form-control" defaultValue={firstName} />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" className="form-control" defaultValue={lastName} />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" className="form-control" defaultValue={email} />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" className="form-control" defaultValue={phone} />
              </div>
            </div>
            <button className="save-changes-btn">Save Changes</button>
          </div>

          {/* Account Information */}
          <div className="profile-card">
            <h2>Account Information</h2>
            <div className="account-info-grid">
              <div className="info-item">
                <div className="info-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div>
                  <span className="label">Account Type</span>
                  <span className="value">Student</span>
                </div>
              </div>
              <div className="info-item success">
                <div className="info-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
                <div>
                  <span className="label">Account Status</span>
                  <span className="value">Active</span>
                </div>
              </div>
              <div className="info-item success">
                <div className="info-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <div>
                  <span className="label">Email Verification</span>
                  <span className="value">Verified</span>
                </div>
              </div>
              <div className="info-item">
                <div className="info-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                </div>
                <div>
                  <span className="label">Email Address</span>
                  <span className="value">Confirm</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bottom-split">
            {/* Security */}
            <div className="profile-card">
              <h2>Security</h2>
              <div className="security-row">
                <div className="security-info">
                  <span className="label">Password</span>
                  <span className="sub-label">Last updated recently</span>
                </div>
                <button className="change-password-btn">Change Password</button>
              </div>
              <button className="logout-all-btn" onClick={handleLogoutHome}>Log out of all devices</button>
            </div>

            {/* Preferences */}
            <div className="profile-card">
              <h2>Preferences</h2>
              
              <div className="preference-item">
                <div className="preference-info">
                  <span className="label">Event reminders</span>
                  <span className="sub-label">Event reminders sent for your bookings.</span>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="preference-item">
                <div className="preference-info">
                  <span className="label">Booking confirmations</span>
                  <span className="sub-label">Receive email booking confirmations.</span>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="preference-item">
                <div className="preference-info">
                  <span className="label">Important event updates</span>
                  <span className="sub-label">Updates on important event changes.</span>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
