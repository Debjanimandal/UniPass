import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/auth.store';
import './StudentDashboard.css';

export default function StudentDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogoutHome = () => {
    logout();
    navigate('/');
  };
  
  // Extract user's full name, or fallback to 'Student' if not available
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Student';

  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/movies?active=true');
        if (res.data.success) {
          // just take the first 3 movies as "Upcoming Events"
          setMovies(res.data.data.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  return (
    <div className="student-dashboard-page">
      {/* ─── Top Navbar ─────────────────────────────────────────── */}
      <nav className="student-navbar">
        <Link to="/" className="student-nav-logo">
          <img src="/logo.png" alt="UniPass Logo" className="logo-img" />
          <span className="logo-text">UniPass</span>
        </Link>
        <div className="student-nav-right">
          <button onClick={handleLogoutHome} className="back-to-home-btn">Back to Home</button>
        </div>
      </nav>

      {/* ─── Blue Secondary Nav ───────────────────────────────────── */}
      <div className="student-secondary-nav">
        <Link to="/student/dashboard" className="active">Dashboard</Link>
        <Link to="/student/bookings">Bookings</Link>
        <Link to="/student/events">Events</Link>
        <Link to="/student/films">Films</Link>
        <Link to="/student/profile">Profile</Link>
      </div>

      {/* ─── Hero Section ───────────────────────────────────────── */}
      <section className="student-hero">
        <div className="student-hero-content">
          <h1>Welcome,<br />{fullName}!</h1>
          <p>
            Your account's summary of your events and recent bookings in your program.
          </p>
        </div>
      </section>

      {/* ─── Main Content Layout ────────────────────────────────── */}
      <main className="student-main-content">
        
        {/* ─── Left Column: Upcoming Events ─────────────────────── */}
        <div className="dashboard-card">
          <h2>Upcoming Events</h2>
          
          <div className="events-list">
            {loading ? (
              <p style={{ color: '#64748b', fontSize: '14px' }}>Loading upcoming events...</p>
            ) : movies.length > 0 ? (
              movies.map((movie) => {
                const dateObj = new Date(movie.validUntil || movie.createdAt);
                const day = dateObj.getDate();
                const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
                const year = dateObj.getFullYear();
                
                return (
                  <div className="event-item" key={movie.movieId}>
                    <div className="event-date-box">
                      <span className="day">{day}</span>
                      <span className="month">{month}</span>
                      <span className="year">{year}</span>
                    </div>
                    <div className="event-details">
                      <h3>{movie.title}</h3>
                      <p>{movie.genre} • {movie.language}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: '#64748b', fontSize: '14px' }}>No upcoming events right now.</p>
            )}
          </div>
        </div>

        {/* ─── Right Column: Tickets & Entry ────────────────────── */}
        <div className="dashboard-sidebar">
          
          {/* My Tickets */}
          <div className="dashboard-card">
            <h2>My Tickets</h2>
            
            <div className="ticket-preview">
              <div className="ticket-header">
                <div className="ticket-header-logo">
                  <img src="/logo.png" alt="Logo" />
                  <span>UniPass</span>
                </div>
                <span className="ticket-badge">Ticket</span>
              </div>
              
              <div className="ticket-body">
                <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', width: '100%' }}>
                  No upcoming tickets.
                </div>
              </div>
            </div>
            
            <button className="btn-view-qr">View QR Code</button>
          </div>

          {/* Secure Entry */}
          <div className="dashboard-card secure-entry-card">
            <img 
              src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=SecureEntryData456" 
              alt="Secure Entry QR" 
              className="secure-qr-large" 
            />
            <h3>Secure Entry</h3>
            <p>Show your QR code to staff for secure entry at the venue.</p>
          </div>
          
        </div>
      </main>
    </div>
  );
}
