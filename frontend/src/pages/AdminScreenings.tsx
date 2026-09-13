import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import './AdminScreenings.css';

export default function AdminScreenings() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogoutHome = () => {
    logout();
    navigate('/');
  };

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Admin Name';

  const upcomingScreenings = [
    {
      id: 1,
      movie: 'Interstellar',
      date: '15 Sep 2026',
      time: '6:00 PM - 9:00 PM',
      screen: 'Screen 1',
      bookings: 72,
      capacity: 120,
      price: 250,
      status: 'Active'
    },
    {
      id: 2,
      movie: 'Inception',
      date: '16 Sep 2026',
      time: '4:00 PM - 6:30 PM',
      screen: 'Screen 2',
      bookings: 88,
      capacity: 100,
      price: 220,
      status: 'Active'
    },
    {
      id: 3,
      movie: 'Oppenheimer',
      date: '15 Sep 2026',
      time: '6:00 PM - 9:00 PM',
      screen: 'Screen 1',
      bookings: 110,
      capacity: 120,
      price: 250,
      status: 'Almost Full'
    },
    {
      id: 4,
      movie: 'The Dark Knight',
      date: '17 Sep 2026',
      time: '6:30 PM - 9:00 PM',
      screen: 'Screen 1',
      bookings: 120,
      capacity: 120,
      price: 200,
      status: 'Sold Out'
    }
  ];

  return (
    <div className="admin-screenings-page">
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
        
        {/* ─── Header ────────────────────────────────────────────── */}
        <div className="screenings-header-section">
          <div className="screenings-header">
            <div className="screenings-header-text">
              <h1>Screenings</h1>
              <p>Schedule and manage movie screenings across your campus screens.</p>
            </div>
            <button className="admin-btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Create Screening
            </button>
          </div>
        </div>

        {/* ─── Status Tabs ───────────────────────────────────────── */}
        <div className="screenings-status-tabs">
          <button className="status-tab active">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <strong>12</strong> Upcoming
          </button>
          <button className="status-tab">
            <span className="dot green"></span>
            <strong>8</strong> Active
          </button>
          <button className="status-tab">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <strong>3</strong> Today
          </button>
          <button className="status-tab">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
            <strong>1</strong> Sold Out
          </button>
        </div>

        {/* ─── Toolbar (Search & Filters) ────────────────────────── */}
        <div className="screenings-toolbar">
          <div className="toolbar-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Search by movie or screening..." />
          </div>
          
          <div className="toolbar-filters">
            <select className="filter-select"><option>Movie [ All Movies ]</option></select>
            <select className="filter-select"><option>Screen [ All Screens ]</option></select>
            <select className="filter-select"><option>Date [ Select Date ]</option></select>
            <select className="filter-select"><option>Status [ All Status ]</option></select>
            <select className="filter-select"><option>Sort [ Date: Soonest First ]</option></select>
            <button className="btn-clear-filters">Clear Filters</button>
          </div>
        </div>

        {/* ─── Today's Highlight ─────────────────────────────────── */}
        <div className="section-title">
          <h2>Today's Highlight</h2>
        </div>
        
        <div className="highlight-card">
          <img src="https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg" alt="Interstellar" className="highlight-poster" />
          
          <div className="highlight-info">
            <h3>INTERSTELLAR</h3>
            <div className="highlight-details">
              <div className="detail-col">
                <span className="date">15 September 2026</span>
                <span className="time">6:00 PM - 9:00 PM</span>
              </div>
              <div className="detail-col">
                <span className="screen-name">Screen 1</span>
                <span className="venue-name">University Auditorium</span>
              </div>
              <div className="detail-col price-col">
                <strong>₹250</strong> / seat
              </div>
            </div>
          </div>
          
          <div className="highlight-progress-section">
            <div className="progress-header">
              <span className="booked-text"><strong>72 / 120</strong> booked</span>
              <span className="percentage">60%</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: '60%' }}></div>
            </div>
            <div className="seats-available-text">48 seats available</div>
          </div>
          
          <div className="highlight-action">
            <button className="btn-manage-highlight">Manage Screening</button>
          </div>
        </div>

        {/* ─── Upcoming Screenings Table ─────────────────────────── */}
        <div className="section-title with-action">
          <h2>Upcoming Screenings</h2>
          <Link to="#" className="view-all-link">View All →</Link>
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
              {upcomingScreenings.map((screening) => (
                <tr key={screening.id}>
                  <td className="fw-600">{screening.movie}</td>
                  <td>{screening.date}</td>
                  <td>{screening.time}</td>
                  <td>{screening.screen}</td>
                  <td className="bookings-cell">
                    <div className="booking-numbers">
                      <strong>{screening.bookings}</strong> / {screening.capacity}
                    </div>
                    <div className="mini-progress-bg">
                      <div 
                        className={`mini-progress-fill ${screening.bookings === screening.capacity ? 'full' : ''}`} 
                        style={{ width: `${(screening.bookings / screening.capacity) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                  <td>{screening.capacity}</td>
                  <td>{screening.capacity - screening.bookings}</td>
                  <td>₹{screening.price}</td>
                  <td>
                    <span className={`status-badge ${
                      screening.status === 'Active' ? 'active' : 
                      screening.status === 'Almost Full' ? 'warning' : 'danger'
                    }`}>
                      {screening.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="btn-manage-outline">Manage</button>
                    <button className="btn-more-outline">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
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
