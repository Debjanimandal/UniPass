import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import './Events.css';

export default function Events() {
  const { user } = useAuthStore();
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Student Name';



  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return (
          <svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        );
      case 'few':
        return (
          <svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        );
      case 'soldout':
        return (
          <svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="events-page">
      {/* ─── Top White Navbar ──────────────────────────────────────── */}
      <nav className="events-top-nav">
        <Link to="/" className="events-logo-container">
          <img src="/logo.png" alt="UniPass Logo" />
          <span className="events-logo-text">UniPass</span>
        </Link>
        <div className="events-user-info">
          <span>Welcome, {fullName}!</span>
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
            alt="User Avatar" 
            className="events-avatar" 
          />
        </div>
      </nav>

      {/* ─── Blue Secondary Nav ────────────────────────────────────── */}
      <nav className="events-blue-nav">
        <Link to="/student/dashboard">Dashboard</Link>
        <Link to="/student/bookings">Bookings</Link>
        <Link to="/student/events" className="active">Events</Link>
        <Link to="/student/films">Films</Link>
        <Link to="/student/profile">Profile</Link>
      </nav>

      {/* ─── Main Content Header ───────────────────────────────────── */}
      <div className="events-header-container">
        <div className="events-header-left">
          <h1>Campus Events & Screenings</h1>
          <p>Discover movies, screenings, and events happening across campus.</p>
        </div>
        <Link to="/student/bookings" className="btn-my-bookings">My Bookings</Link>
      </div>

      {/* ─── Filters Bar ───────────────────────────────────────────── */}
      <div className="events-filters-bar">
        <div className="search-input-wrapper">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" placeholder="Search events or movies" />
        </div>
        
        <div className="filter-group">
          <span className="filter-label">Date</span>
          <div className="filter-select">
            [ All Dates <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg> ]
          </div>
        </div>
        
        <div className="filter-group">
          <span className="filter-label">Category</span>
          <div className="filter-select">
            [ All Categories <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg> ]
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-label">Language</span>
          <div className="filter-select">
            [ All Languages <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg> ]
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-label">Screen</span>
          <div className="filter-select">
            [ All Screens <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg> ]
          </div>
        </div>

        {/* Date Chips */}
        <div className="date-chips">
          <div className="date-chip active">
            <span className="day">15</span>
            <span className="month">Sep</span>
          </div>
          <div className="date-chip">
            <span className="day">16</span>
            <span className="month">Sep</span>
          </div>
          <div className="date-chip">
            <span className="day">17</span>
            <span className="month">Sep</span>
          </div>
          <div className="date-chip">
            <span className="day">18</span>
            <span className="month">Sep</span>
          </div>
          <div className="date-chip">
            <span className="day">19</span>
            <span className="month">Sep</span>
          </div>
        </div>
      </div>

      {/* ─── Featured Screening ──────────────────────────────────── */}
      <section className="events-section">
        <h2 className="section-title">Featured Screening</h2>
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', background: '#f8fafc', borderRadius: '12px' }}>
          No featured screening at the moment. Check back soon!
        </div>
      </section>

      {/* ─── Upcoming Events ───────────────────────────────────────── */}
      <section className="events-section">
        <div className="upcoming-section-header">
          <h2>Upcoming Events</h2>
          <p>Find your next experience on campus.</p>
        </div>
        
        <div className="events-grid">
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', gridColumn: '1/-1' }}>
            No upcoming events scheduled yet. Check back soon!
          </div>
        </div>
      </section>

    </div>
  );
}
