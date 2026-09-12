import { Link, useNavigate } from 'react-router-dom';
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
            {/* Event 1 */}
            <div className="event-item">
              <div className="event-date-box">
                <span className="day">15</span>
                <span className="month">Sept</span>
                <span className="year">2026</span>
              </div>
              <div className="event-details">
                <h3>University University Event</h3>
                <p>6:00 PM • Screen 1, University</p>
              </div>
            </div>
            
            {/* Event 2 */}
            <div className="event-item">
              <div className="event-date-box">
                <span className="day">20</span>
                <span className="month">Sept</span>
                <span className="year">2026</span>
              </div>
              <div className="event-details">
                <h3>University University Event</h3>
                <p>6:00 PM • Screen 1, University</p>
              </div>
            </div>

            {/* Event 3 */}
            <div className="event-item">
              <div className="event-date-box">
                <span className="day">Wed</span>
                <span className="month">Sept</span>
                <span className="year">2026</span>
              </div>
              <div className="event-details">
                <h3>University University Schonight</h3>
                <p>6:00 PM • Screen 2, University</p>
              </div>
            </div>
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
                {/* QR Code Placeholder (Mock image) */}
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MockTicketData123" 
                  alt="QR Code" 
                  className="ticket-qr-placeholder" 
                />
                
                <div className="ticket-info">
                  <h3>INTERSTELLAR</h3>
                  <p>15 Sept 2026<br />6:00 PM<br />Screen 1 • Seat A3</p>
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
