import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { authApi } from "../services/api.client";
import "./Profile.css";

export default function Profile() {
  const { user, logout, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    authApi.me()
      .then((res) => {
        const freshUser = res.data?.data ?? res.data;
        if (freshUser) updateUser(freshUser);
      })
      .catch(() => {
        setFetchError("Could not load profile. Please check your connection.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogoutHome = () => {
    logout();
    navigate("/");
  };

  const fullName    = user ? user.firstName + " " + user.lastName : "—";
  const email       = user?.email     ?? "—";
  const phone       = user?.phone     ?? "—";
  const firstName   = user?.firstName ?? "";
  const lastName    = user?.lastName  ?? "";
  const role        = user?.role === "ADMIN" ? "Administrator" : user?.role === "GUARD" ? "Guard" : "Student";
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "September 2026";
  const avatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=" + encodeURIComponent(email);

  return (
    <div className="profile-page">

      <nav className="profile-top-nav">
        <Link to="/" className="profile-logo-container">
          <img src="/logo.png" alt="UniPass Logo" />
          <span className="profile-logo-text">UniPass</span>
        </Link>
        <div className="profile-user-info">
          <span>Welcome, {fullName}!</span>
          <img src={avatarUrl} alt="User Avatar" className="profile-avatar" />
        </div>
      </nav>

      <div className="profile-blue-nav">
        <Link to="/student/dashboard">Dashboard</Link>
        <Link to="/student/bookings">Bookings</Link>
        <Link to="/student/events">Events</Link>
        <Link to="/student/films">Films</Link>
        <Link to="/student/profile" className="active">Profile</Link>
      </div>

      <div className="profile-header-container">
        <h1>My Profile</h1>
        <p>Manage your UniPass account and personal information.</p>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
          Loading your profile...
        </div>
      )}

      {fetchError && (
        <div style={{ textAlign: "center", padding: "20px", color: "#dc2626", background: "#fee2e2", margin: "0 40px", borderRadius: "8px" }}>
          {fetchError}
        </div>
      )}

      {!loading && (
        <div className="profile-content">

          <div className="profile-left-column">
            <div className="profile-card user-info-card">
              <img src={avatarUrl} alt="User Avatar" className="user-avatar-large" />
              <h3>{fullName}</h3>
              <p className="email">{email}</p>
              <p className="role">{role} Account</p>
              <p className="status">{user?.isActive ? "Active" : "Inactive"}</p>
              <p className="member-since">Member since {memberSince}</p>
              <button className="edit-profile-btn">Edit Profile</button>
            </div>

            <div className="profile-card">
              <h2>Booking Overview</h2>
              <div className="booking-stats">
                <div className="stat-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"></path></svg>
                  <span className="label">Total<br />Bookings:</span>
                  <span className="value">—</span>
                </div>
                <div className="stat-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="8" width="18" height="12" rx="2"></rect><path d="M7 8V6a2 2 0 012-2h6a2 2 0 012 2v2"></path></svg>
                  <span className="label">Upcoming<br />Tickets:</span>
                  <span className="value">—</span>
                </div>
                <div className="stat-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  <span className="label">Completed<br />Events:</span>
                  <span className="value">—</span>
                </div>
              </div>
            </div>

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

          <div className="profile-right-column">
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
                  <input type="email" className="form-control" defaultValue={email} readOnly />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" className="form-control" defaultValue={phone} />
                </div>
              </div>
              <button className="save-changes-btn">Save Changes</button>
            </div>

            <div className="profile-card">
              <h2>Account Information</h2>
              <div className="account-info-grid">
                <div className="info-item">
                  <div className="info-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  </div>
                  <div><span className="label">Account Type</span><span className="value">{role}</span></div>
                </div>
                <div className={"info-item" + (user?.isActive ? " success" : "")}>
                  <div className="info-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                  <div><span className="label">Account Status</span><span className="value">{user?.isActive ? "Active" : "Inactive"}</span></div>
                </div>
                <div className="info-item success">
                  <div className="info-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  </div>
                  <div><span className="label">Email Address</span><span className="value">{email}</span></div>
                </div>
                <div className="info-item">
                  <div className="info-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  </div>
                  <div><span className="label">Member Since</span><span className="value">{memberSince}</span></div>
                </div>
              </div>
            </div>

            <div className="bottom-split">
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
      )}
    </div>
  );
}
